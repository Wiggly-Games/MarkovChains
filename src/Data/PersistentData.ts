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
        AddStartKey: Statement;
        UpdateStartKey: Statement;
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
        return "";
    }
    async AddStartingKey(key: string): Promise<void> {
        let currentValue = await this._queries.GetStartCount.get(key);

        if (currentValue) {
            await this._queries.UpdateStartKey.run(key, currentValue + 1);
        } else {
            await this._queries.AddStartKey.run(key, 1);
        }
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
            GetCount: await db.prepare(`SELECT COUNT(1) FROM Transitions WHERE CurrentSet = '?'`),
            GetNext: await db.prepare(`SELECT NextValue FROM Transitions WHERE CurrentSet = '?'`),

            GetStartCount: await db.prepare(`SELECT SeenCount FROM StartKeys WHERE KEY = '?'`),
            AddStartKey: await db.prepare(`INSERT INTO StartKeys (Key, SeenCount) VALUES ('?', ?)`),
            UpdateStartKey: await db.prepare(`UPDATE StartKeys SET SeenCount = ? WHERE Key = '?'`)
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