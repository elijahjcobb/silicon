/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiObject, SiObjectProps, SiPointer, SiQuery} from "./index";

interface TestProps extends SiObjectProps {
	name: string;
	age: number;
}

const obj = new SiObject<TestProps>("user", {name: "Elijah", age: 21});
obj.get("name");

const query = new SiQuery<TestProps>("user");

query.equalTo("age", 23);
query.greaterThan("age", 32);