/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObject, SiObjectProps} from "./index";
import * as Mongo from "mongodb";

// interface UserProps extends SiObjectProps<UserProps> {
// 	name: string;
// 	age: number;
// 	test: Tester;
// }
//
// class User extends SiObject<UserProps> {
//
// 	public constructor(name: string, age: number) {
// 		super("user", {name, age, test: new Tester()}, {
// 			test: Tester
// 		});
// 	}
//
// }
//
// class Tester implements SiCodable<string> {
//
// 	public x: string = "Hello, world!";
//
// 	public decode(): string {
// 		return this.x;
// 	}
//
// 	public encode(value: string): void {
// 		this.x = value;
// 	}
//
// }
//
// interface StoryProps extends SiObjectProps<StoryProps> {
// 	title: string;
// 	content?: string | undefined;
// 	user: SiPointer<SiObject<UserProps>>;
// }
//
// class Story extends SiObject<StoryProps> {
//
// 	public constructor(title: string, user: SiObject<UserProps>) {
//
// 		super("story", {title, user: SiPointer.to(user)}, {
// 			user: SiPointer
// 		});
//
// 	}
//
// }

interface UserProps extends SiObjectProps<UserProps> {
	name: string;
	age: number;
	isAdmin: boolean;
	password: Buffer;
}

class User extends SiObject<UserProps> {

	public constructor(props: UserProps) {

		super("user", props);

	}

}

(async (): Promise<void> => {

	await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: true});

	// const user = new User({
	// 	name: "Elijah",
	// 	age: 21,
	// 	isAdmin: true,
	// 	password: Buffer.from("Hello, world!", "utf8")
	// });
	//
	// await user.save();

	const res = await SiDatabase.getSession().getDatabase().collection("user").findOne({_id: new Mongo.ObjectId("5ed174035318204dd33a8073")});

	const user = new User({
		name: "Elijah",
		age: 21,
		isAdmin: true,
		password: Buffer.from("few")
	});

	user.decode(res);

	console.log(user.get("password"));

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));