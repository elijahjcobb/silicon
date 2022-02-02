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

	const x = await SiQuery.init(User, {name: "Domi"}).getFirst();
	if (!x) return;

	console.log(x.toJSON());
	x.put("age", x.get("age") + 1);
	await x.save();
	console.log(await x.encode());
	console.log(x.toJSON());

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));