import { SiDatabase, SiObject } from "../index";
import { SiID, SiObjectProps } from "../SiObject";

interface UserProps extends SiObjectProps {
	name: string;
	age?: number;
	isAdmin?: boolean;
	partner?: SiID;
	secret?: Buffer;
}

class User extends SiObject<UserProps> {

	public constructor(props: UserProps) {
		super("user", props);
	}

}

describe("Pre Database", () => {

	test("SiObject Props", () => {

		const u1 = new User({
			name: "Elijah",
			age: 22
		});

		const u2 = new User({
			name: "John",
			age: 20
		});

		["foo", 32, false, "isAdmin", "secret"].forEach(v => {
			//@ts-ignore
			expect(u1.get(v)).toBeUndefined();
		});

		const HELLO_WORLD = "Hello, world!";
		expect(u1.get("secret")).not.toBeDefined();
		u1.put("secret", Buffer.from(HELLO_WORLD));
		expect(u1.get("secret")).toBeDefined();
		expect(u1.get("secret") == Buffer.from(HELLO_WORLD)).toBeFalsy();
		expect(u1.get("secret")?.equals(Buffer.from(HELLO_WORLD))).toBeTruthy();
		expect(u1.get("secret")?.toString()).toEqual(HELLO_WORLD);

		expect(u1.get("name")).toEqual("Elijah");
		expect(u1.get("age")).toStrictEqual(22);
		expect(u1.getId()).toBeUndefined();
		expect(() => u1.getHexId()).toThrowError();

		expect(u1).not.toEqual(u2);
		expect(u1.get("name")).not.toEqual(u2.get("name"));
		expect(u1.get("age")).not.toEqual(u2.get("age"));

	});

	test("SiObject Pre-DB", async () => {
		const u1 = new User({ name: "Elijah" });
		expect(() => u1.save()).rejects.toBeDefined();
		expect(() => u1.update({name: "John"})).rejects.toBeDefined();
		expect(() => u1.delete()).rejects.toBeDefined();
		expect(u1.exists()).toStrictEqual(false);
		expect(() => u1.refresh()).rejects.toBeDefined();
	})

})

describe("SiObject Using DB", () => {

	beforeAll(async () => {
		await SiDatabase.init({
			database: "silicon",
			address: "mongodb://localhost:27017"
		});
	})

	afterAll(() => SiDatabase.close());

	test("Saving", async () => {

		const u1 = new User({
			name: "Elijah",
			age: 22
		});

		expect(u1.exists()).toStrictEqual(false);
		await expect(u1.save()).resolves.not.toThrow();
		expect(u1.exists()).toStrictEqual(true);
		expect(u1.getId()).toBeDefined();
		expect(() => u1.getIdForce()).not.toThrow()
		expect(() => u1.getHexId()).not.toThrow()
		expect(u1.getHexId()).toBeDefined();
		expect(u1.getHexId()).toStrictEqual(u1.getHexId());

		const u2 = new User({ name: "John" });
		await expect(u2.save()).resolves.not.toThrow();
		expect(u1.getId()).toBeDefined();
		expect(u1.getHexId()).toBeDefined();
		expect(u1.getHexId()).not.toEqual(u2.getHexId());
		
		u1.put("partner", u2.getId());
		await expect(u1.save()).resolves.not.toThrow();

	})

	test("Flood", async () => {
		const proms = [];
		const users: User[] = [];
		for (let i = 0; i < 1000; i++) {
			const u = new User({
				name: `John ${i}th`,
				age: i
			});
			users.push(u);
			proms.push(u.save());
		}
		expect(users.length).toEqual(1000);
		expect(proms.length).toEqual(1000);
		await expect(Promise.all(proms)).resolves.not.toThrow();
		users.forEach((u, i) => {
			expect(u).toBeDefined();
			expect(u.get("age")).toStrictEqual(i);
		})
	});

});