/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiObject, SiObjectProps} from "./SiObject";
import {SiCodable} from "./SiCodable";
import {SiDatabase} from "./SiDatabase";
import {SiQuery} from "./SiQuery";

export interface SiPointerProps {
	$ref: string;
	$id: Mongo.ObjectId;
	$db: string;
}

export class SiPointer<T extends SiObject<any>> implements SiCodable<SiPointerProps>{

	private _collection: string;
	private _id: Mongo.ObjectId;

	public constructor(instance: T) {

		const id = instance.getId();
		if (id === undefined) throw new Error("You cannot create a pointer to an SiObject that does not have an id.");
		this._collection = instance.getCollection();
		this._id = id;

	}

	public encode(value: SiPointerProps) {
		this._id = value.$id;
		this._collection = value.$ref;
	}

	public decode(): SiPointerProps {
		return {
			$id: this._id,
			$db: SiDatabase.getSession().getDatabaseName(),
			$ref: this._collection
		};
	}

	public async fetch(): Promise<T> {

		const query = new SiQuery<T, P>()

	}
}