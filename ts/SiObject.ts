/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiPointer} from "./SiPointer";
import {SiError} from "./SiError";

export type SiObjectPropsAllowedValue = string | number | boolean | Buffer | SiPointer<any> | undefined;
export type SiObjectProps= { [key: string]: SiObjectPropsAllowedValue };
export type SiObjectBase = { updatedAt: number, createdAt: number};
export type SiObjectSpecialEncoding = {type: string};

export class SiObject<T extends SiObjectProps> {

	private readonly _props: T;
	private readonly _collection: string;
	private _updatedAt: number;
	private _createdAt: number;
	private _id: Mongo.ObjectId | undefined;

	public constructor(collection: string, props: T) {

		this._props = props;
		this._updatedAt = Date.now();
		this._createdAt = Date.now();
		this._collection = collection;

	}

	public updatedAt(): number {
		return this._updatedAt;
	}

	public createdAt(): number {
		return this._createdAt;
	}

	public id(): Mongo.ObjectId {

		if (this._id === undefined) throw SiError.undefinedId;
		return this._id;

	}

	public collection(): string {
		return this._collection;
	}

	public idSafe(): Mongo.ObjectId | undefined {
		return this._id;
	}

	public set<K extends keyof T>(key: K, value: T[K]): void {

		this._props[key] = value;

	}

	public get<K extends keyof T>(key: K): T[K] {

		return this._props[key];

	}

	public print(): void {
		console.log(`<${this._collection}>:\t\t\t${this._id ? this._id.toHexString() : "'no id'"}`);
		console.log("Last Updated:\t" + this._updatedAt);
		console.log("Created At:\t\t" + this._createdAt);
		console.log(JSON.stringify(this._props, undefined, 4));
	}

	public encode(): object {

		const encodedProps: { [key: string]: any } = {};
		for (const key of Object.keys(this._props)) {

			const value = this._props[key];
			if (value instanceof SiPointer) {
				encodedProps[key] = value.encode();
			} else if (Buffer.isBuffer(value)) {
				encodedProps[key] = {type: "SiBuffer", value: value.toString("base64")};
			} else encodedProps[key] = value;

		}

		return {
			...encodedProps,
			updatedAt: this._updatedAt,
			createdAt: this._createdAt
		};

	}

	public decode(): void {



	}

	public async save(): Promise<void> {

	}

	public async delete(): Promise<void> {

	}

}