/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObject, SiObjectProps, SiQuery, SiValue} from "./index";

interface UserProps extends SiObjectProps {
	name: string;
	age: number;
	email: string;
	isAdmin: boolean;
	password: Buffer;
	friend: User;
}

class User extends SiObject<UserProps> {
	public constructor(props: UserProps) {
		super("user", {
			name: SiValue.String,
			age: SiValue.Number,
			email: SiValue.String,
			isAdmin
		}, props);
	}
}

(async (): Promise<void> => {

	await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: true});

	const q = new SiQuery(User, {age: {$gt: 20}});
	const x = await q.getAll();
	for (const y of x) console.log(y.get("name"));


	// const user = new User({
	// 	name: "Domi",
	// 	age: 21,
	// 	isAdmin: false,
	// 	email: "dominikabobik12@gmail.com",
	// 	password: Buffer.from("aaabbbb")
	// });
	//
	// await user.save();




})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));