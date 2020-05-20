/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObject, SiObjectProps, SiQuery} from "./index";
import {SiPointer} from "./SiPointer";

interface User extends SiObjectProps<User> {
	name: string;
}

interface Story extends SiObjectProps<Story> {
	title: string;
	content?: string | undefined;
	user: SiPointer<SiObject<User>>;
}

(async (): Promise<void> => {

	// await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: false});
	const user = new SiObject<User>("user", {name: "Elijah"});
	const story = new SiObject<Story>("story", {title: "Hello, world!", user: new SiPointer(user)});

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));