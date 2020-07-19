/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiObject, SiObjectProps, SiPointer, SiQuery} from "./index";

interface User extends SiObjectProps {
	name: string;
	age: number;
	address?: SiPointer<Address>;
}

interface Address extends SiObjectProps {
	zip: number;
}

const address = new SiObject<Address>("address", {zip: 49696});

const obj = new SiObject<User>("user", {name: "Elijah", age: 21});
obj.get("name");

obj.print();
console.log(obj.encode());

const query: SiQuery<User> = new SiQuery<User>("user")
	.greaterThan("age", 23)
	.lessThan("age", 50);

query.equalTo("name", "Elijah");