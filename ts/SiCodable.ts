/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiObjectBasePropValue} from "./SiObject";

export interface SiCodable<T extends SiObjectBasePropValue> {
	discriminator: "SiCodable";
	decode(value: T): void;
	encode(): T;
}

export function isCodable(instance: any): instance is SiCodable<any> {
	return typeof instance === "object" && instance.hasOwnProperty("discriminator") && instance.discriminator === "SiCodable";
}