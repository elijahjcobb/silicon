/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiObjectOld, SiDatabase} from "./index";
import * as MongoDB from "mongodb";

export type SiObjectFactory<T, P> = { new<P>(): T };

type SiQueryConstructAllowedKey = {
	"$lt": true,
	"$gt": true,
	"$lte": true,
	"$gte": true,
	"$ne": true,
	"$in": true,
	"$nin": true
};
type SiQueryConstructAllowedBaseValue = string | number | boolean | MongoDB.ObjectID;
type SiQueryConstructAllowedValue<P extends object> = SiQueryConstructAllowedBaseValue | {
	[key in keyof SiQueryConstructAllowedKey]?: SiQueryConstructAllowedBaseValue | string[] | number[]
} | SiQueryConstructor<P>[];
type SiQueryConstructor<P extends object> = {
	[key in keyof P]?: SiQueryConstructAllowedValue<P>;
} | { [key in keyof {"updatedAt": 1, "createdAt": 1, "_id": 1, "$or": 1}]?: SiQueryConstructAllowedValue<P>};

export class SiQuery<T extends SiObjectOld<P>, P extends object> {

	private readonly factory: SiObjectFactory<T, P>;
	private readonly collectionString: string;
	private readonly query: SiQueryConstructor<P>;

	private limit: number;
	private collection: MongoDB.Collection | undefined;
	private readonly sort: (keyof P | "$asc" | "$desc")[][];

	public constructor(factory: SiObjectFactory<T, P>, query: SiQueryConstructor<P>) {

		this.factory = factory;
		this.collectionString = (new this.factory()).getCollection();
		this.query = query;
		this.sort = [];
		this.limit = 100_000;

	}

	private initializeNewObject(): T {

		return new this.factory();

	}

	private async initCollection(): Promise<MongoDB.Collection> {

		if (this.collection === undefined) this.collection = await SiDatabase.getSession().getDatabase().collection(this.collectionString);
		return this.collection;

	}

	private getOptionsObject(): object {
		return {
			limit: this.limit,
			sort: this.sort
		};
	}

	public setLimit(count: number): void { this.limit = count; }
	public addSort(key: keyof P, direction: "$asc" | "$desc"): void { this.sort.push([key, direction]); }

	public async getFirst(): Promise<T | undefined> {

		const oldLimit: number = this.limit;
		this.limit = 1;
		const res: Array<T> = await this.getAll();
		this.limit = oldLimit;

		return res[0];

	}

	public async getAll(): Promise<Array<T>> {

		const collection: MongoDB.Collection = await this.initCollection();

		// TODO fix mongo types to support Silicon type system.
		// @ts-ignore
		const cursor: MongoDB.Cursor = collection.find<object>(this.query, this.getOptionsObject());

		const responsesUnformed: object[] = await cursor.toArray();

		return responsesUnformed.map((response: object): T => {

			const obj: T = this.initializeNewObject();
			obj.decode(response);

			return obj;

		});

	}

	public async count(): Promise<number> {

		// TODO fix mongo types to support Silicon type system.
		// @ts-ignore
		return await (await this.initCollection()).countDocuments(this.query);

	}

	public async exists(): Promise<boolean> {

		return (await this.count()) > 0;

	}

	public static async getObjectForId<T extends SiObjectOld<P>, P extends object>(factory: SiObjectFactory<T, P>, id: string): Promise<T | undefined> {

		const query: SiQuery<T, P> = new SiQuery<T, P>(factory, {_id: new MongoDB.ObjectId(id)});
		return await query.getFirst();

	}

	public static async getAll<T extends SiObjectOld<P>, P extends object>(factory: SiObjectFactory<T, P>, limit: number = 100): Promise<T[]> {

		const query: SiQuery<T, P> = new SiQuery<T, P>(factory, {});
		query.setLimit(limit);
		return await query.getAll();

	}

}