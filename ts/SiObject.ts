/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiDatabase} from "./SiDatabase";
// import {SiPointer, SiPointerProps} from "./SiPointer";

export type SiID = Mongo.ObjectId;
export type SiObjectPropValue = string | number | boolean | Buffer | SiID | undefined | object; // | SiPointer<any>;
export type SiObjectProps<T extends object = {}> = { [key in keyof T]: SiObjectPropValue; };
export type SiObjectBaseProperties = { _id: string | undefined, updatedAt: number, createdAt: number };

export function createSiID(id: string): SiID {
	return new Mongo.ObjectId(id);
}

export enum SiValue {
	String,
	Number,
	Boolean,
	Buffer,
	Object,
	Id
}
export type SiSchema<T extends object> = { [key in keyof T]: SiValue | {type: SiValue, required?: boolean, unique?: boolean}};

export class SiObject<T extends SiObjectProps<T>> {

	private _id: Mongo.ObjectId | undefined;
	private _updatedAt: number;
	private _createdAt: number;
	private readonly _props: T;
	// private readonly _schema: SiSchema<T>;
	private readonly _collection: string;

	public constructor(collection: string, props: T) {

		this._collection = collection;
		this._props = props;
		// this._schema = {};
		this._updatedAt = Date.now();
		this._createdAt = Date.now();

	}

	private getDatabaseCollection(): Mongo.Collection {

		return SiDatabase.getSession().getDatabase().collection(this._collection);

	}

	// private getSchemaKey(key: keyof T): {type: SiValue, required: boolean, unique: boolean} {
	// 	const schema = this._schema[key];
	// 	if (Object.keys(schema).includes("required")) {
	// 		//@ts-ignore
	// 		return {type: schema.type, unique: schema.unique, required: schema.unique};
	// 	} else {
	// 		//@ts-ignore
	// 		return {type: schema.type, unique: false, required: false};
	// 	}
	// }

	public getCollection(): string {

		return this._collection;

	}

	public getId(): Mongo.ObjectId | undefined {

		return this._id;

	}

	public getIdForce(): Mongo.ObjectId {
		if (!this._id) throw new Error("This object does not have an id yet.");
		return this._id;
	}

	public getHexId(): string {
		const id = this.getId();
		if (!id) throw new Error("This object does not have an id yet.");
		return id.toHexString();
	}

	public getUpdatedAt(): number {

		return this._updatedAt;

	}

	public getCreatedAt(): number {

		return this._createdAt;

	}

	public exists(): boolean {

		return this._id !== undefined;

	}

	public toJSON<K extends keyof T>(...keys: K[]): {
		[P in K]: T[P];
	} & {id: string, updatedAt: number, createdAt: number} {

		const map: T = {} as T;
		if (keys.length === 0) keys = (Object.keys(this._props) as K[]);
		for (const key of keys) map[key] = this._props[key];

		return {id: this.getHexId(), updatedAt: this._updatedAt, createdAt: this._createdAt, ...map};

	}

	public put<K extends keyof T, V extends T[K]>(key: K, value: V): void {

		this._updatedAt = Date.now();
		this._props[key] = value;

	}

	public set(props: Pick<T, keyof T>): void {

		this._updatedAt = Date.now();
		for (const key in props) this.put(key, props[key]);

	}

	public get<K extends keyof T>(key: K): T[K] {

		return this._props[key];

	}

	public async delete(): Promise<void> {

		if (!this.exists()) throw new Error("SiObject does not contain an id. First call create().");
		await this.getDatabaseCollection().deleteOne({_id: this.getId()});

	}

	public async save(): Promise<void> {

		const values = await this.encode();

		if (this._id === undefined) {
			this._id = (await this.getDatabaseCollection().insertOne(values)).insertedId;
		} else {
			await this.getDatabaseCollection().updateOne({_id: this._id}, {$set: values});
		}

	}

	public decode(props: SiObjectBaseProperties & T): void {

		this._id = new Mongo.ObjectId(props._id);
		this._updatedAt = props.updatedAt;
		this._createdAt = props.createdAt;

		delete props._id;
		delete props.updatedAt;
		delete props.createdAt;

		for (const k in props) {
			// @ts-ignore
			const v = props[k];

			if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
				// @ts-ignore
				this._props[k] = v;
			} else if (typeof v === "object") {

				if (v.hasOwnProperty("id")) {
					const data = v["id"] as Buffer;
					const str = data.toString("hex");
					const id = createSiID(str);
					// @ts-ignore
					this._props[k] = id;
				} else if (v.hasOwnProperty("_bsontype")) {
					if (v["_bsontype"] === "Binary" && v.hasOwnProperty("buffer")) {
						const data = v["buffer"];
						if (Buffer.isBuffer(data)) {
							//@ts-ignore
							this._props[k] = v["buffer"];
						}
					}
				} else {
					// @ts-ignore
					this._props[k] = v;
				}

			} else SiDatabase.neon.err(`Received prop value that is not allowed. Type = ${typeof v}, Value = ${v}`);
		}

	}

	public async encodeProps(): Promise<object> {

		const newProps: Partial<T> = {};

		for (const key in this._props) {
			const value = this._props[key];
			// const schema = this.getSchemaKey(key);
			// if (value === undefined && schema.required) throw new Error(`Key '${key}' was undefined but the schema required a value.`);

			// if (schema.unique) {
			// 	const query = {};
			// 	// @ts-ignore
			// 	query[key] = value;
			// 	const count = await this.getDatabaseCollection().countDocuments(query);
			// 	if (count > 0) throw new Error(`Unique key '${key}' already has duplicate value '${value}' ${count} times.`);
			//
			// }

			newProps[key] = value;
		}


		return newProps;

	}

	public async encode(): Promise<object> {

		const props = await this.encodeProps();
		const obj = {
			...props,
			updatedAt: this._updatedAt,
			createdAt: this._createdAt,
			id: this._id?.toHexString()
		};

		if (this._id === undefined) delete obj.id;

		return obj;

	}

	public async update(props: Pick<T, keyof T>): Promise<void> {

		if (!this.exists()) throw new Error("SiObject does not contain an id. First call create().");
		this.set(props);

		const updateValue = {...(await this.encodeProps()), updatedAt: this._updatedAt};
		await this.getDatabaseCollection().updateOne({_id: this.getId()}, {$set: updateValue});


	}

	public async refresh(): Promise<void> {

		if (this._id === undefined) throw new Error("SiObject does not contain an id. First call create().");
		const props = (await this.getDatabaseCollection().findOne({_id: this._id}));
		if (props === undefined) throw new Error(`Could not find props for SiObject with id: ${this._id.toHexString()}.`);

		this.decode(props);

	}

}