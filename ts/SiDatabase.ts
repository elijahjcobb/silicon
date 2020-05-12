/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {Neon} from "@element-ts/neon";
import * as MongoDB from "mongodb";

export type SiDatabaseConstructor = {
	address: string,
	database: string;
	debug?: boolean;
};

export class SiDatabase {

	private readonly address: string;
	private readonly database: string;
	private client: MongoDB.MongoClient | undefined;
	private connection: MongoDB.Db | undefined;

	private static session: SiDatabase | undefined;

	private constructor(config: SiDatabaseConstructor) {

		this.address = config.address;
		this.database = config.database;

		if (config.debug) {
			Neon.enable();
			Neon.setTitle("@element-ts/silicon");
		}

	}

	private async connect(): Promise<void> {

		Neon.log("Database will connect.");

		this.client = await MongoDB.MongoClient.connect(this.address, {useUnifiedTopology: true});
		this.connection = this.client.db(this.database);

		Neon.log("Database did connect.");

	}

	public getDatabase(): MongoDB.Db {

		Neon.log("Database will get database.");

		if (this.connection === undefined) throw new Error("You must first start a SiDatabase session with SiDatabase.init() before accessing the database.");

		Neon.log("Database did get database.");

		return this.connection;

	}

	public static async init(config: SiDatabaseConstructor): Promise<void> {

		const database: SiDatabase = new SiDatabase(config);
		await database.connect();

		this.session = database;

	}

	public static getSession(): SiDatabase {

		if (this.session === undefined) throw new Error("You must first start a SiDatabase session with SiDatabase.init() before accessing the database.");
		return this.session;

	}

	public static close(): void {

		SiDatabase.session?.client?.close();
		SiDatabase.session = undefined;

	}

}