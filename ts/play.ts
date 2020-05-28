/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObject, SiObjectProps} from "./index";
import {SiPointer} from "./SiPointer";
import {SiCodable} from "./SiCodable";

interface UserProps extends SiObjectProps<UserProps> {
	name: string;
	age: number;
	test: Tester;
}

class User extends SiObject<UserProps> {

	public constructor(name: string, age: number) {
		super("user", {name, age, test: new Tester()}, {
			test: Tester
		});
	}

}

class Tester implements SiCodable<string> {

	public x: string = "Hello, world!";

	public decode(): string {
		return this.x;
	}

	public encode(value: string): void {
		this.x = value;
	}

}

interface StoryProps extends SiObjectProps<StoryProps> {
	title: string;
	content?: string | undefined;
	user: SiPointer<SiObject<UserProps>>;
}

class Story extends SiObject<StoryProps> {

	public constructor(title: string, user: SiObject<UserProps>) {

		super("story", {title, user: SiPointer.to(user)}, {
			user: SiPointer
		});

	}

}

(async (): Promise<void> => {

	// await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: false});
	const user = new User("Elijah", 12);

	user.put("test", new Tester());

	const story = new Story("Hello, world!", user);

	story.put("user", SiPointer.to(user));

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));