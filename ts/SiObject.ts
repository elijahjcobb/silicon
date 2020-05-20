/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiDatabase} from "./SiDatabase";
import {SiPointer} from "./SiPointer";

export type SiExtractProps<P> = P extends SiObject<infer T> ? T : never;
export type SiObjectBasePropValue = string | number | boolean | Buffer;
export type SiObjectPropValue = SiObjectBasePropValue | SiPointer<any>;
export type SiObjectProps<T extends object = {}> = { [key in keyof T]: SiObjectPropValue; };
export type SiObjectBaseProperties = { id: string | undefined, updatedAt: number, createdAt: number };

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

		return {id: this._id?.toHexString(), updatedAt: this._updatedAt, createdAt: this._createdAt, ...map};

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

		const values = {...this._props, updatedAt: this._updatedAt, createdAt: this._createdAt};

		if (this._id === undefined) {
			this._id = (await this.getDatabaseCollection().insertOne(values)).insertedId;
		} else {
			await this.getDatabaseCollection().updateOne({_id: this._id}, {$set: values});
		}

	}

	public decode(props: T & SiObjectBaseProperties): void {

		this._id = new Mongo.ObjectId(props.id);
		this._updatedAt = props.updatedAt || Date.now();
		this._createdAt = props.createdAt || Date.now();

		delete props.id;
		delete props.updatedAt;
		delete props.createdAt;

		this._props = props as T;

	}

	public encode(): T & SiObjectBaseProperties {

		throw new Error("not implemented");

	}

	public async update(props: Pick<T, keyof T>): Promise<void> {

		if (!this.exists()) throw new Error("SiObject does not contain an id. First call create().");
		this.set(props);
		const updateValue = {...this._props, updatedAt: this._updatedAt};
		await this.getDatabaseCollection().updateOne({_id: this.getId()}, {$set: updateValue});


	}

	public async refresh(): Promise<void> {

		if (this._id === undefined) throw new Error("SiObject does not contain an id. First call create().");
		const props = (await this.getDatabaseCollection().findOne({_id: this._id}));
		if (props === undefined) throw new Error(`Could not find props for SiObject with id: ${this._id.toHexString()}.`);

		this.decode(props);

	}

}