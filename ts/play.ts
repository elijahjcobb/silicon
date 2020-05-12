/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObject, SiQuery} from "./index";

interface UserProps { name: string; age: number; data: Buffer; }
class User extends SiObject<UserProps> {public constructor() { super("user"); }}

(async (): Promise<void> => {

	await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: false});

	const user: User | undefined = await SiQuery.getObjectForId(User, "5ebacc214ce0a0460435afd5");
	if (user === undefined) return;

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));