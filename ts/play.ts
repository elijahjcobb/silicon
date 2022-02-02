/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiID, SiObject, SiObjectProps, SiQuery, SiSchema, SiValue, createSiID} from "./index";

interface UserProps extends SiObjectProps {
	name: string;
	age: number;
	favoriteColor?: string;
}

interface PetProps extends SiObjectProps {
	name: string;
	age: number;
	color: string;
	breed: string;
	ownerId?: SiID;
}

class User extends SiObject<UserProps> {
	public constructor(props: UserProps) {
		super("users", props);
	}
}

class Pet extends SiObject<PetProps> {
	public constructor(props: PetProps) {
		super("pets", props);
	}
}

(async (): Promise<void> => {

	await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: true});

	//
	// const domi = new User({
	// 	name: "Sam",
	// 	age: 24
	// });
	//
	// await domi.save();
	//
	// const pet1 = new Pet({
	// 	name: "Max",
	// 	age: 1,
	// 	color: "gold",
	// 	ownerId: domi.getId(),
	// 	breed: "cat"
	// });
	//
	// await pet1.save();


	// const query = new SiQuery(User, {age: {$gt: 23}});
	// const users = await query.getAll();
	// for (const u of users) console.log(`Hello, my name is ${u.get("name")} I am ${u.get("age")} years old.`);

	// const owners = await (SiQuery.init(User).descending("age").setLimit(100)).getAll();
	// for (const o of owners) console.log(o.get("name"), o.get("age"));


	const oldDogs = await SiQuery.init(Pet, {age: {$gt: 10}}).getAll();
	for (const d of oldDogs) {
		const owner = await SiQuery.getForId(User, d.get("ownerId"));
		if (!owner) continue;
		owner.get("favoriteColor");
		console.log(owner.get("name"));
	}






})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));