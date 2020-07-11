/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {SiObject, SiObjectProps} from "./SiObject";

export class SiQuery<T extends SiObjectProps> {

	public constructor(collection: string) {

	}

	public equalTo<K extends keyof T>(key: K, value: T[K]): void {}
	public notEqualTo<K extends keyof T>(key: K, value: T[K]): void {}
	public greaterThan<K extends keyof T, V extends T[K] & number>(key: K, value: V): void {}
	public greaterThanOrEqualTo<K extends keyof T, V extends T[K] & number>(key: K, value: V): void {}
	public lessThan<K extends keyof T, V extends T[K] & number>(key: K, value: V): void {}
	public lessThanOrEqualTo<K extends keyof T, V extends T[K] & number>(key: K, value: V): void {}
	public isDefined(key: keyof T): void {}
	public isUndefined(key: keyof T): void {}
	public ascending(key: keyof T): void {}
	public descending(key: keyof T): void {}
	public limit(value: number): void {}
	public skip(value: number): void {}
	public in(key: keyof T, array: any[]): void {}
	public notIn(key: keyof T, array: any[]): void {}
	public startsWith<K extends keyof T, V extends T[K] & string>(key: K, value: V): void {}
	public endsWith<K extends keyof T, V extends T[K] & string>(key: K, value: V): void {}
	public contains<K extends keyof T, V extends T[K] & string>(key: K, value: V): void {}

	public and(...queries: SiQuery<T>[]): void {}
	public or(...queries: SiQuery<T>[]): void {}

	public async find(): Promise<SiObject<T>[]> { return []; }
	public async count(): Promise<number> { return 1; }

}