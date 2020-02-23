/**
 *
 * Elijah Cobb
 *
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 *
 */
import {SiLogger} from "./SiLogger";
import * as MongoDB from "mongodb";

export type SiDatabaseConstructor = {
	address: string,
	database: string;
	verbose?: boolean;
};

export class SiDatabase {

	private readonly address: string;
	private readonly database: string;
	private logger: SiLogger | undefined;
	private client: MongoDB.MongoClient | undefined;
	private connection: MongoDB.Db | undefined;

	private static session: SiDatabase | undefined;

	private constructor(config: SiDatabaseConstructor) {

		this.address = config.address;
		this.database = config.database;
		this.logger = new SiLogger(config.verbose);

	}

	private async connect(): Promise<void> {

		SiDatabase.log(this, "Database will connect.");

		this.client = await MongoDB.MongoClient.connect(this.address, {useUnifiedTopology: true});
		this.connection = this.client.db(this.database);

		SiDatabase.log(this, "Database did connect.");

	}

	public getDatabase(): MongoDB.Db {

		SiDatabase.log(this, "Database will get database.");

		if (this.connection === undefined) throw new Error("You must first start a SiDatabase session with SiDatabase.init() before accessing the database.");

		SiDatabase.log(this, "Database did get database.");

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

	public static log(object: object, msg: string): void {

		if (SiDatabase.session === undefined) return;
		SiDatabase.session?.logger?.log(object, msg);

	}

	public static close(): void {

		SiDatabase.session?.client?.close();
		SiDatabase.session = undefined;

	}

}