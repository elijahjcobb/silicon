/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiDatabase} from "./SiDatabase";
import {SiPointer, SiPointerProps} from "./SiPointer";

export type SiObjectPropValue = string | number | boolean | Buffer | object | SiPointer<any>;
export type SiObjectProps<T extends object = {}> = { [key in keyof T]: SiObjectPropValue; };
export type SiObjectBaseProperties = { _id: string | undefined, updatedAt: number, createdAt: number };

export class SiObject<T extends SiObjectProps<T>> {

	private _id: Mongo.ObjectId | undefined;
	private _updatedAt: number;
	private _createdAt: number;
	private _props: T;
	private readonly _collection: string;

	public constructor(collection: string, props: T) {

		this._collection = collection;
		this._props = props;
		this._updatedAt = Date.now();
		this._createdAt = Date.now();

	}

	private getDatabaseCollection(): Mongo.Collection {

		return SiDatabase.getSession().getDatabase().collection(this._collection);

	}

	public getCollection(): string {

		return this._collection;

	}

	public getId(): Mongo.ObjectId | undefined {

		return this._id;

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
	} & SiObjectBaseProperties {

		const map: T = {} as T;
		for (const key of keys) map[key] = this._props[key];

		return {_id: this._id?.toHexString(), updatedAt: this._updatedAt, createdAt: this._createdAt, ...map};

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

		const values = this.encode();

		SiDatabase.neon.log(this._id);
		SiDatabase.neon.log(values);

		if (this._id === undefined) {
			this._id = (await this.getDatabaseCollection().insertOne(values)).insertedId;
		} else {
			await this.getDatabaseCollection().updateOne({_id: this._id}, {$set: values});
		}

	}

	public decode(props: SiObjectBaseProperties & T): void {

		console.log(props);

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

				if (v.hasOwnProperty("_bsontype")) {
					if (v["_bsontype"] === "Binary" && v.hasOwnProperty("buffer")) {
						const data = v["buffer"];
						if (Buffer.isBuffer(data)) {
							//@ts-ignore
							this._props[k] = v["buffer"];
						}
					}
				}

			} else SiDatabase.neon.err(`Received prop value that is not allowed. Type = ${typeof v}, Value = ${v}`);
		}

	}

	public encodeProps(): object {

		const newProps: Partial<T> = {};

		for (const key in this._props) {
			const value = this._props[key];
			if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
				newProps[key] = value;
			} else if (typeof value === "object") {
				if (value instanceof SiPointer) {
					// @ts-ignore
					newProps[key] = value.encode();
				} else {
					newProps[key] = value;
				}
			} else SiDatabase.neon.err(`Received prop value that is not allowed. Type = ${typeof value}, Value = ${value}`);
		}


		return newProps;

	}

	public encode(): object {

		const obj = {
			...this.encodeProps(),
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
		const updateValue = {...this.encodeProps(), updatedAt: this._updatedAt};
		await this.getDatabaseCollection().updateOne({_id: this.getId()}, {$set: updateValue});


	}

	public async refresh(): Promise<void> {

		if (this._id === undefined) throw new Error("SiObject does not contain an id. First call create().");
		const props = (await this.getDatabaseCollection().findOne({_id: this._id}));
		if (props === undefined) throw new Error(`Could not find props for SiObject with id: ${this._id.toHexString()}.`);

		this.decode(props);

	}

}