/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {SiObject, SiObjectProps, SiObjectSpecialEncoding} from "./SiObject";
import * as Mongo from "mongodb";
import {SiError} from "./SiError";

export type SiPointerProps = {
	collection: string,
	id: Mongo.ObjectId
};

export class SiPointer<T extends SiObjectProps> {

	private readonly _collection: string;
	private readonly _id: Mongo.ObjectId;
	private obj: SiObject<T> | undefined;

	private constructor(collection: string, id: Mongo.ObjectId) {
		this._collection = collection;
		this._id = id;
	}

	public async refresh(): Promise<SiObject<T>> {
		throw SiError.notImplemented;
	}

	public async fetch(): Promise<SiObject<T>> {
		throw SiError.notImplemented;
	}

	public encode(): SiPointerProps & SiObjectSpecialEncoding {
		return {collection: this._collection, id: this._id, type: "SiPointer"};
	}

	public static createPointer<T extends SiObjectProps>(object: SiObject<T>): SiPointer<T> {
		return new SiPointer<T>(object.collection(), object.id());
	}

	public static fetchPointer<T extends SiObjectProps>(collection: string, id: Mongo.ObjectId): SiPointer<T> {
		return new SiPointer<T>(collection, id);
	}

}