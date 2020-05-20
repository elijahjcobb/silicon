/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiDatabase} from "./index";
import * as MongoDB from "mongodb";

export type SiObjectBaseProperties = {updatedAt: number, createdAt: number, id: string};
export type SiObjectUserProperties<T extends object> = T;
export type SiObjectProperties<T extends object> = SiObjectBaseProperties & SiObjectUserProperties<T>;
export type SiObjectPropertyKeys<T extends object> = keyof SiObjectProperties<T>;

export abstract class SiObjectOld<T extends object = object> {

	private id: string | undefined;
	private updatedAt: number | undefined;
	private createdAt: number | undefined;
	private readonly collection: string;
	public props: SiObjectUserProperties<T>;

	/**
	 * Protected constructor that should be called via super().
	 * @param collection The name of the collection this object exists in.
	 */
	protected constructor(collection: string) {

		this.collection = collection;
		SiDatabase.neon.log(`SiObject created for '${collection}' collection.`);
		this.props = {} as SiObjectUserProperties<T>;

	}

	/**
	 * Decode the id from Mongo.
	 * @param value The id object.
	 */
	private decodeId(value: { id: Buffer }): void {

		if (typeof value !== "object") throw new Error("Id object is not a valid object.");
		const idData: Buffer = value["id"];
		this.id = idData.toString("hex");

	}

	/**
	 * Get the database collection object for this object's collection.
	 */
	private getDatabaseCollection(): MongoDB.Collection {

		return SiDatabase.getSession().getDatabase().collection(this.collection);

	}

	/**
	 * Get the database collection but first check that the object has an id set.
	 */
	private getCollectionForModification(): MongoDB.Collection {

		if (this.id === undefined) throw new Error(`The ${this.collection} you are trying to operate on has not been created in the database yet. Please call 'create()'.`);

		return this.getDatabaseCollection();

	}

	/**
	 * Get the mongo id object for this object.
	 */
	private getMongoId(): MongoDB.ObjectId {

		return new MongoDB.ObjectId(this.id);

	}

	/**
	 * Convert this object into JSON.
	 */
	protected encode(): SiObjectProperties<T> {

		SiDatabase.neon.log( `SiObject will encode.`);
		this.objectWillEncode();

		const obj: SiObjectProperties<T> = this.props as SiObjectProperties<T>;

		obj.updatedAt = this.updatedAt;
		obj.createdAt = this.createdAt;

		SiDatabase.neon.log(`SiObject did encode.`);
		this.objectDidEncode();

		return obj;

	}

	/**
	 * Will be called before an object's encode() method is called.
	 */
	protected objectWillEncode(): void {}

	/**
	 * Will be called after an object's encode() method is called.
	 */
	protected objectDidEncode(): void {}

	/**
	 * Will be called before an object's decode() method is called.
	 */
	protected objectWillDecode(): void {}

	/**
	 * Will be called after an object's decode() method is called.
	 */
	protected objectDidDecode(): void {}

	/**
	 * Will be called before an object's update() method is called.
	 */
	protected objectWillUpdate(): void {}

	/**
	 * Will be called after an object's update() method is called.
	 */
	protected objectDidUpdate(): void {}

	/**
	 * Will be called before an object's create() method is called.
	 */
	protected objectWillCreate(): void {}

	/**
	 * Will be called after an object's create() method is called.
	 */
	protected objectDidCreate(): void {}

	/**
	 * Will be called before an object's delete() method is called.
	 */
	protected objectWillDelete(): void {}

	/**
	 * Will be called after an object's delete() method is called.
	 */
	protected objectDidDelete(): void {}

	/**
	 * Will be called before an object's fetch() method is called.
	 */
	protected objectWillFetch(): void {}

	/**
	 * Will be called after an object's fetch() method is called.
	 */
	protected objectDidFetch(): void {}

	/**
	 * Change this object's reference id.
	 * @param id The new id for this object.
	 */
	protected setId(id: string): void { this.id = id; }

	/**
	 * Get a value from this object's props.
	 * @param prop The name of the prop.
	 */
	public get<K extends keyof T>(prop: K): T[K] | undefined {

		return this.props[prop];

	}

	/**
	 * Get a value from this object's props and check it is defined.
	 * @param prop The name of the prop.
	 */
	public getUnsafe<K extends keyof T>(prop: K): T[K] {

		const value: T[K] | undefined = this.props[prop];
		if (value === undefined) throw new Error(`The value for key '${prop}' is undefined.`);

		return value;

	}

	/**
	 * Set an object's prop.
	 * @param prop The prop name.
	 * @param value The new value for the prop.
	 */
	public set<K extends keyof T>(prop: K, value: T[K]): void {

		this.props[prop] = value;

	}

	/**
	 * Print this object.
	 */
	public print(): void {
		console.log(this.getJSON());
	}

	/**
	 * Get the collection name of this object.
	 */
	public getCollection(): string { return this.collection; }

	/**
	 * Get the id of this object and check it is defined.
	 */
	public getId(): string {

		if (this.id === undefined) throw new Error("This object's 'id' is undefined. You must first call fetch or create.");
		return this.id;
	}

	/**
	 * Get the timestamp this object was created at and check it is defined.
	 */
	public getCreatedAt(): number {

		if (this.createdAt === undefined) throw new Error("This object's 'createdAt' is undefined. You must first call fetch or create.");
		return this.createdAt;

	}

	/**
	 * Get the timestamp this object was updated at last and check it is defined.
	 */
	public getUpdatedAt(): number {

		if (this.updatedAt === undefined) throw new Error("This object's 'updatedAt' is undefined. You must first call fetch or create.");
		return this.updatedAt;

	}

	/**
	 * Whether or not this object exists in the database.
	 */
	public exists(): boolean {

		return this.id !== undefined;

	}

	/**
	 * Get the id of this object in the database.
	 */
	public getIdNullable(): string | undefined { return this.id; }

	/**
	 * Get the timestamp this object was updated at last.
	 */
	public getUpdatedAtNullable(): number | undefined { return this.updatedAt; }

	/**
	 * Get the timestamp that this object was created at.
	 */
	public getCreatedAtNullable(): number | undefined { return this.createdAt; }

	/**
	 * Get the JSON of this object for specific keys including built in ones.
	 * If you supply no keys, all will be provided.
	 * @param keys The keys to include, if none provided, all will be added.
	 */
	public getJSON(...keys: (keyof T)[]): SiObjectProperties<T> {

		const encodedData: SiObjectProperties<T> = this.encode();
		let filteredData: SiObjectProperties<T> = {};

		if (keys.length === 0) filteredData = encodedData;
		else for (const key of keys) filteredData[key] = encodedData[key];

		filteredData.id = this.id;
		filteredData.updatedAt = this.updatedAt;
		filteredData.createdAt = this.createdAt;

		return filteredData;

	}

	/**
	 * Decode an object onto this object.
	 * @param obj An object from Mongo.
	 */
	public decode(obj: object): void {

		SiDatabase.neon.log(`SiObject will decode.`);
		this.objectWillDecode();

		const properties: SiObjectProperties<T> = obj as SiObjectProperties<T>;

		// This set the id to the underlying id from mongo.
		// @ts-ignore
		this.decodeId(properties["_id"]);

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

		SiDatabase.neon.log(`SiObject did decode.`);
		this.objectDidDecode();

	}

	/**
	 * Create this object in the database.
	 */
	public async create(): Promise<void> {

		SiDatabase.neon.log( `SiObject will save.`);
		this.objectWillCreate();

		const collection: MongoDB.Collection = this.getDatabaseCollection();

		if (this.id !== undefined) throw new Error("You cannot create an object that already has an id.");

		this.createdAt = Date.now();
		this.updatedAt = Date.now();

		const obj: SiObjectProperties<T> = this.encode();
		const res: MongoDB.InsertOneWriteOpResult<any> = await collection.insertOne(obj);

		this.decodeId(res.insertedId);

		SiDatabase.neon.log( `SiObject did save.`);
		this.objectDidCreate();

	}

	/**
	 * Update this object in the database. If no keys are provided, all will be updated.
	 * @param keys The keys to update.
	 */
	public async update(...keys: SiObjectPropertyKeys<T>[]): Promise<void> {

		SiDatabase.neon.log( `SiObject will update.`);
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
		valuesToSet["updatedAt"] = this.updatedAt;

		const newValues: object = {$set: valuesToSet};
		await collection.updateOne({_id: this.getMongoId()}, newValues);

		SiDatabase.neon.log( `SiObject did update.`);
		this.objectDidUpdate();

	}

	/**
	 * Fetch this object from the database and overwrite local values.
	 * @param id Supplying an id will pull in the object that the id corresponds to.
	 */
	public async fetch(id?: string): Promise<void> {

		SiDatabase.neon.log( `SiObject will fetch.`);
		this.objectWillFetch();

		if (id) this.id = id;

		const collection: MongoDB.Collection = this.getCollectionForModification();
		const res: object | null = await collection.findOne({_id: this.getMongoId()});
		if (res == null) throw new Error(`Could not find a ${this.collection} for id '${this.id}'.`);

		this.decode(res);

		SiDatabase.neon.log( `SiObject did fetch.`);
		this.objectDidFetch();

	}

	/**
	 * Delete this object from the database.
	 * @param id The id of this object or any object.
	 */
	public async delete(id?: string): Promise<void> {

		SiDatabase.neon.log( `SiObject will delete.`);
		this.objectWillDelete();

		if (id) this.id = id;

		const collection: MongoDB.Collection = this.getCollectionForModification();
		await collection.deleteOne({_id: this.getMongoId()});

		SiDatabase.neon.log( `SiObject did delete.`);
		this.objectDidDelete();

	}


}