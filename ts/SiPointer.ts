/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiObject} from "./SiObject";
import {SiDatabase} from "./SiDatabase";

export interface SiPointerProps {
	$ref: string;
	$id: Mongo.ObjectId;
	$db: string;
}

export class SiPointer<T extends SiObject<any>> {

	private _collection: string;
	private _id?: Mongo.ObjectId;

	public constructor(instance: T) {

		const id = instance.getId();
		this._collection = instance.getCollection();
		this._id = id;

	}

	public decode(value: SiPointerProps) {
		this._id = value.$id;
		this._collection = value.$ref;
	}

	public encode(): SiPointerProps {

		if (this._id === undefined) throw new Error("Id of collection undefined.");

		return {
			$id: this._id,
			$db: SiDatabase.getSession().getDatabaseName(),
			$ref: this._collection
		};

	}

	public async fetch(): Promise<T | undefined> {

		return undefined;

	}

	public static to<T extends SiObject<any>>(instance: T): SiPointer<T> {

		return new SiPointer<T>(instance);

	}

}