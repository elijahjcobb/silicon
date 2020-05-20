/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase, SiObjectOld, SiQuery} from "./index";
import {SiLink} from "./SiLink";

interface StoryProps {
	title: string;
	content: string;
}

class Story extends SiObjectOld<StoryProps> {

	public constructor() {
		super("story");
	}

}

interface UserProps {
	name: string;
	age: number;
	data: Buffer;
	story: SiLink<Story>;
}

class User extends SiObjectOld<UserProps> {

	public constructor() {
		super("user");
	}

}

(async (): Promise<void> => {

	// await SiDatabase.init({address: "mongodb://localhost:27017", database: "silicon", debug: false});
	const user = new User();
	user.props.name = "Elijah";
	user.props.story = new SiLink("");

	user.props.story.

})().then((): void => SiDatabase.close()).catch((err: any): void => console.error(err));