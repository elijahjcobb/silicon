/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiPointer} from "./SiPointer";

export type SiObjectPropsAllowedValue = string | number | boolean | Buffer | SiPointer<any>;
export type SiObjectProps= { [key: string]: SiObjectPropsAllowedValue };

export class SiObject<T extends SiObjectProps> {

	private _props: T;
	private _updatedAt: number;
	private _createdAt: number;
	private _id: Mongo.ObjectId | undefined;

	public constructor(collection: string, props: T) {

		this._props = props;
		this._updatedAt = Date.now();
		this._createdAt = Date.now();

	}

	public updatedAt(): number {
		return this._updatedAt;
	}

	public createdAt(): number {
		return this._createdAt;
	}

	public id(): Mongo.ObjectId {

		if (this._id === undefined) throw new Error("Instance does not have an object id.");
		return this._id;

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

	}

	public async save(): Promise<void> {

	}

	public async delete(): Promise<void> {

	}

}