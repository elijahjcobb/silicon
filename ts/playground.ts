/**
 *
 * Elijah Cobb
 *
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 *
 */

import {SiDatabase, SiObject, SiQuery} from "./index";

interface UserProps { name: string; age: number; data: Buffer; }
class User extends SiObject<UserProps> {

	public constructor() { super("user"); }

}

(async (): Promise<void> => {

	await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", verbose: false});

	const user: User = new User();
	user.props.name = "Elijah";
	user.props.age = 20;
	user.props.data = Buffer.alloc(32, 1);
	await user.create();

	const u2: User | undefined = await SiQuery.getObjectForId(User, user.getId());
	u2?.print();

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));