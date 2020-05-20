/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiObjectBasePropValue} from "./SiObject";

export interface SiCodable<T> {
	encode(value: T): void;
	decode(): T;
}