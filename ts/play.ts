/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObject, SiSchema, SiValue} from "./index";

interface UserProps {
	name: string;
	age: number;
	email: string;
	isAdmin: boolean;
	password: Buffer;
}

class User extends SiObject<UserProps> {

	public constructor(props: UserProps) {

		super("user", {
			name: {type: SiValue.String, required: true},
			age: {type: SiValue.String, required: true},
			email: {type: SiValue.String, required: true, unique: true},
			isAdmin: SiValue.Boolean,
			password: SiValue.Buffer
		}, props);

	}

}

(async (): Promise<void> => {

	await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: true});

	const user2 = new User({
		name: "Domi",
		age: 21,
		isAdmin: false,
		email: "few",
		password: Buffer.from("aaaa")
	});

	const user = new User({
		name: "Elijah",
		age: 22,
		isAdmin: true,
		email: "wef",
		password: Buffer.from("bbbb")
	});

	await user2.save();
	await user.save();

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));