/*
    The PersistentData class implements a Markov Chain using a database, instead of wrapping it in memory.
    This allows the system to prioritize saving memory, at the cost of taking longer to train and generate.
*/


import { IData } from "../../interfaces";
import * as sqlite from 'sqlite'
import * as sqlite3 from "sqlite3";
import { Arrays } from "../Helpers";

type Statement = sqlite.Statement<sqlite3.Statement>;
type Database = sqlite.Database<sqlite3.Database, sqlite3.Statement>;

export class PersistentData implements IData {
    _path: string;
    _database: Database | undefined;

    private _queries: {
        Insert: Statement;
        GetCount: Statement;
        GetNext: Statement;

        GetStartCount: Statement;
        UpdateStartKey: Statement;
        GetAllKeys: Statement;
    }

    constructor(path: string) {
        this._path = path;
    }

    async GetCount(sequence: string): Promise<number> {
        return await this._queries.GetCount.get(sequence);
    }
    async Get(sequence: string): Promise<string> {
        let results = await this._queries.GetNext.all(sequence);
        let row = Arrays.GetRandom(results);

        return row ? row.NextValue : undefined;
    }
    async Add(sequence: string, next: string): Promise<void> {
        await this._queries.Insert.run(sequence, next);
    }
    async GetStartKey(): Promise<string> {
        const keys = await this._queries.GetAllKeys.all() as ({Key: string, SeenCount: number})[];
        const result = Arrays.GetRandomFromProbabilities(keys, (key) => key.SeenCount);
        return result?.Key;
    }

    async AddStartingKey(key: string): Promise<void> {
        await this._queries.UpdateStartKey.run(key);
    }

    // Connects to the database.
    async Connect() {
        const db = await sqlite.open({
            filename: `${this._path}/Database.db`,
            driver: sqlite3.Database
        });
        
        // Create the tables
        await db.exec(`CREATE TABLE IF NOT EXISTS StartKeys (
            Key TEXT PRIMARY KEY,
            SeenCount INTEGER
        )`);

        await db.exec(`CREATE TABLE IF NOT EXISTS Transitions (
            Id INTEGER PRIMARY KEY,
            CurrentSet TEXT,
            NextValue TEXT
        )`);

        // Prepare the queries
        this._queries = {
            Insert: await db.prepare(`INSERT INTO Transitions (CurrentSet, NextValue) VALUES (?, ?)`),
            GetCount: await db.prepare(`SELECT COUNT(1) FROM Transitions WHERE CurrentSet = ?`),
            GetNext: await db.prepare(`SELECT NextValue FROM Transitions WHERE CurrentSet = ?`),

            GetStartCount: await db.prepare(`SELECT SeenCount FROM StartKeys WHERE KEY = ?`),
            UpdateStartKey: await db.prepare(`
                INSERT INTO StartKeys (Key, SeenCount) VALUES (?, ?) ON CONFLICT(Key) DO UPDATE SET SeenCount=SeenCount + 1
            `),
            GetAllKeys: await db.prepare(`SELECT Key,SeenCount FROM StartKeys`)
        }
        
        this._database = db;
    }

    // Closes the database.
    async Disconnect() {
        for (const query of Object.values(this._queries)) {
            await query.finalize();
        }
        await this._database.close();
    }
}