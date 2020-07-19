/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {SiObject, SiObjectProps} from "./SiObject";
import {SiPointer} from "./SiPointer";

export class SiQuery<T extends SiObjectProps> {

	public constructor(collection: string) {

	}

	public equalTo<K extends keyof T>(key: K, value: T[K]): SiQuery<T> { return this; }
	public notEqualTo<K extends keyof T>(key: K, value: T[K]): SiQuery<T> { return this; }
	public greaterThan<K extends keyof T, V extends T[K] & number>(key: K, value: V): SiQuery<T> { return this; }
	public greaterThanOrEqualTo<K extends keyof T, V extends T[K] & number>(key: K, value: V): SiQuery<T> { return this; }
	public lessThan<K extends keyof T, V extends T[K] & number>(key: K, value: V): SiQuery<T> { return this; }
	public lessThanOrEqualTo<K extends keyof T, V extends T[K] & number>(key: K, value: V): SiQuery<T> { return this; }
	public isDefined(key: keyof T): SiQuery<T> { return this; }
	public isUndefined(key: keyof T): SiQuery<T> { return this; }
	public ascending(key: keyof T): SiQuery<T> { return this; }
	public descending(key: keyof T): SiQuery<T> { return this; }
	public limit(value: number): SiQuery<T> { return this; }
	public skip(value: number): SiQuery<T> { return this; }
	public in(key: keyof T, array: any[]): SiQuery<T> { return this; }
	public notIn(key: keyof T, array: any[]): SiQuery<T> { return this; }
	public startsWith<K extends keyof T, V extends T[K] & string>(key: K, value: V): SiQuery<T> { return this; }
	public endsWith<K extends keyof T, V extends T[K] & string>(key: K, value: V): SiQuery<T> { return this; }
	public contains<K extends keyof T, V extends T[K] & string>(key: K, value: V): SiQuery<T> { return this; }
	public hasPointer<K extends keyof T, V extends T[K] & SiPointer<any>>(key: K, pointer: V): SiQuery<T> { return this; }
	public and(...queries: SiQuery<T>[]): SiQuery<T> { return this; }
	public or(...queries: SiQuery<T>[]): SiQuery<T> { return this; }

	public async find(): Promise<SiObject<T>[]> { return []; }
	public async count(): Promise<number> { return 1; }

}