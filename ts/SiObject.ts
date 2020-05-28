/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as Mongo from "mongodb";
import {SiDatabase} from "./SiDatabase";
import {SiPointerProps} from "./SiPointer";
import {isCodable, SiCodable} from "./SiCodable";

// export type SiExtractProps<P> = P extends SiObject<infer T> ? T : never;
export type SiObjectBasePropValue = string | number | boolean | Buffer | SiPointerProps;
export type SiObjectPropValue = SiObjectBasePropValue | SiCodable<any>;
export type SiObjectProps<T extends object = {}> = { [key in keyof T]: SiObjectPropValue; };
export type SiObjectBaseProperties = { id: string | undefined, updatedAt: number, createdAt: number };
type SiFactory<T> = { new(): T; };
type SiObjectFactoryCodableProperties<T extends SiObjectProps<T>> = {
	[K in keyof T]: T[K] extends SiCodable<any> ? K : never;
}[keyof T];
type SiObjectFactory<T extends SiObjectProps<T>> = {
	[K in keyof Pick<T, SiObjectFactoryCodableProperties<T>>]: SiFactory<SiCodable<any>>;
};
type SiObjectEncodedProps<T extends SiObjectProps> = { [K in keyof T]: SiObjectBasePropValue; };

export class SiObject<T extends SiObjectProps<T>> {

	private _id: Mongo.ObjectId | undefined;
	private _updatedAt: number;
	private _createdAt: number;
	private _props: T;
	private readonly _factory: SiObjectFactory<T>;
	private readonly _collection: string;

	public constructor(collection: string, props: T, factory: SiObjectFactory<T>) {

		this._collection = collection;
		this._props = props;
		this._updatedAt = Date.now();
		this._createdAt = Date.now();
		this._factory = factory;

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

		this._id = props.id ? new Mongo.ObjectId(props.id) : undefined;
		this._updatedAt = props.updatedAt;
		this._createdAt = props.createdAt;

		const newProps = {};

		for (const key in props) {
			if (key === "id" || key === "updatedAt" || key === "createdAt") continue;
			const value = props[key];
			if (this._factory.hasOwnProperty(key)) {
				const factory = this._factory[key];
				newProps[key] = (new factory()).decode(value);
			}

		}

	}

	public encodeProps(): SiObjectEncodedProps<T> {

		const encodedProps: Partial<SiObjectEncodedProps<T>> = {};

		for (const key in this._props) {
			const value = this._props[key];
			if (isCodable(value)) encodedProps[key] = value.encode();
			else if (value !== undefined) {
				// @ts-ignore
				encodedProps[key] = value;
			}
		}

		return encodedProps as SiObjectEncodedProps<T>;

	}

	public encode(): SiObjectEncodedProps<T> & SiObjectBaseProperties {
		return {
			...this.encodeProps(),
			id: this._id?.toHexString(),
			updatedAt: this._updatedAt,
			createdAt: this._createdAt
		};
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