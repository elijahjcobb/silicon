/**
 *
 * Elijah Cobb
 *
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 *
 */

import {Neon} from "@element-ts/neon";
import {SiDatabase} from "../database/SiDatabase";
import * as MongoDB from "mongodb";
import {type} from "os";

export type SiObjectBaseProperties = Partial<{updatedAt: number, createdAt: number}>;
export type SiObjectUserProperties<T extends object> = Partial<T>;
export type SiObjectProperties<T extends object> = SiObjectBaseProperties & SiObjectUserProperties<T>;
export type SiObjectPropertyKeys<T extends object> = keyof SiObjectProperties<T>;

export abstract class SiObject<T extends object = object> {

	private id: string | undefined;
	private updatedAt: number | undefined;
	private createdAt: number | undefined;
	private readonly collection: string;
	public props: SiObjectUserProperties<T>;

	protected constructor(collection: string) {

		this.collection = collection;
		Neon.log(`SiObject created for '${collection}' collection.`);
		this.props = {} as SiObjectUserProperties<T>;

	}

	private getDatabaseCollection(): MongoDB.Collection {

		return SiDatabase.getSession().getDatabase().collection(this.collection);

	}

	private getCollectionForModification(): MongoDB.Collection {

		if (this.id === undefined) throw new Error(`The ${this.collection} you are trying to operate on has not been created in the database yet. Please call 'create()'.`);

		return this.getDatabaseCollection();

	}

	private getMongoId(): MongoDB.ObjectId {

		return new MongoDB.ObjectId(this.id);

	}

	protected objectWillEncode(): void {}
	protected objectDidEncode(): void {}
	protected objectWillDecode(): void {}
	protected objectDidDecode(): void {}
	protected objectWillUpdate(): void {}
	protected objectDidUpdate(): void {}
	protected objectWillCreate(): void {}
	protected objectDidCreate(): void {}
	protected objectWillDelete(): void {}
	protected objectDidDelete(): void {}
	protected objectWillFetch(): void {}
	protected objectDidFetch(): void {}

	protected setId(id: string): void { this.id = id; }

	public getCollection(): string { return this.collection; }

	public getId(): string {

		if (this.id === undefined) throw new Error("This object's 'id' is undefined. You must first call fetch or create.");
		return this.id;
	}

	public getCreatedAt(): number {

		if (this.createdAt === undefined) throw new Error("This object's 'createdAt' is undefined. You must first call fetch or create.");
		return this.createdAt;

	}

	public getUpdatedAt(): number {

		if (this.updatedAt === undefined) throw new Error("This object's 'updatedAt' is undefined. You must first call fetch or create.");
		return this.updatedAt;

	}

	public getIdNullable(): string | undefined { return this.id; }
	public getUpdatedAtNullable(): number | undefined { return this.updatedAt; }
	public getCreatedAtNullable(): number | undefined { return this.createdAt; }

	public getJSON(...keys: (keyof T)[]): Partial<T> {

		const encodedData: SiObjectProperties<T> = this.encode();
		const filteredData: SiObjectProperties<T> = {};
		for (const key of keys) filteredData[key] = encodedData[key];

		return filteredData;

	}

	public encode(): SiObjectProperties<T> {

		Neon.log( `SiObject will encode.`);
		this.objectWillEncode();

		const obj: SiObjectProperties<T> = this.props as SiObjectProperties<T>;

		obj.updatedAt = this.updatedAt;
		obj.createdAt = this.createdAt;

		Neon.log(`SiObject did encode.`);
		this.objectDidEncode();

		return obj;

	}

	public decode(obj: object): void {

		Neon.log(`SiObject will decode.`);
		this.objectWillDecode();

		const properties: SiObjectProperties<T> = obj as SiObjectProperties<T>;

		// This set the id to the underlying id from mongo.
		// @ts-ignore
		this.id = properties["_id"]["id"].toString("hex");

		this.updatedAt = properties.updatedAt;
		this.createdAt = properties.createdAt;

		// delete properties.id;
		delete properties.updatedAt;
		delete properties.createdAt;

		// This just removes the underlying _id provided by Mongo from props.
		// @ts-ignore
		delete properties["_id"];

		this.props = properties as SiObjectUserProperties<T>;

		const keys: string[] = Object.keys(properties);
		for (const key of keys) {
			// @ts-ignore
			const value: any = properties[key];
			if (typeof value === "object") {

				if (value["_bsontype"] === "Binary") {
					// @ts-ignore
					properties[key] = Buffer.from(value["buffer"]);
				}

			}
		}

		Neon.log(`SiObject did decode.`);
		this.objectDidDecode();

	}

	public print(): void {
		console.log({
			id: this.id,
			updatedAt: this.updatedAt,
			createdAt: this.createdAt,
			props: this.props
		});
	}

	public async create(): Promise<string> {

		Neon.log( `SiObject will save.`);
		this.objectWillCreate();

		const collection: MongoDB.Collection = this.getDatabaseCollection();

		if (this.id !== undefined) throw new Error("You cannot create an object that already has an id.");

		this.createdAt = Date.now();
		this.updatedAt = Date.now();

		const obj: SiObjectProperties<T> = this.encode();
		const res: MongoDB.InsertOneWriteOpResult<any> = await collection.insertOne(obj);

		this.id = res.insertedId.id.toString("hex");

		Neon.log( `SiObject did save.`);
		this.objectDidCreate();

		return res.insertedId;

	}

	public async update(...keys: SiObjectPropertyKeys<T>[]): Promise<number> {

		Neon.log( `SiObject will update.`);
		this.objectWillUpdate();

		const collection: MongoDB.Collection = this.getCollectionForModification();

		this.updatedAt = Date.now();

		const encodedData: object = this.encode();
		let valuesToSet: object = {};
		if (keys.length === 0) valuesToSet = encodedData;
		else {
			for (const key of keys) {
				// The below line is ignoring types only to make the type easier, it will not actually cause problems
				// as the types have already been validated and the props object is private.
				// @ts-ignore
				valuesToSet[key] = encodedData[key];
			}
		}

		// Again, this is still type-safe as it is already checked.
		// Just saving the updatedAt to no matter what (if user doesnt supply in keys) it will be updated.
		// @ts-ignore
		valuesToSet["updatedAt"] = Date.now();

		const newValues: object = {$set: valuesToSet};

		const res: MongoDB.UpdateWriteOpResult = await collection.updateOne({_id: this.getMongoId()}, newValues);


		Neon.log( `SiObject did update.`);
		this.objectDidUpdate();

		return res.modifiedCount;

	}

	public async delete(id?: string): Promise<void> {

		Neon.log( `SiObject will delete.`);
		this.objectWillDelete();

		if (id) this.id = id;

		const collection: MongoDB.Collection = this.getCollectionForModification();
		await collection.deleteOne({_id: this.getMongoId()});

		Neon.log( `SiObject did delete.`);
		this.objectDidDelete();

	}

	public async fetch(id?: string): Promise<void> {

		Neon.log( `SiObject will fetch.`);
		this.objectWillFetch();

		if (id) this.id = id;

		const collection: MongoDB.Collection = this.getCollectionForModification();
		const res: object | null = await collection.findOne({_id: this.getMongoId()});
		if (res == null) throw new Error(`Could not find a ${this.collection} for id '${this.id}'.`);

		this.decode(res);

		Neon.log( `SiObject did fetch.`);
		this.objectDidFetch();

	}


}