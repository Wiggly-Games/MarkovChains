/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";
import * as Files from "@wiggly-games/files";
import { LoadWithObjects, SaveWithObjects } from "../Helpers";
import { IBag } from "@wiggly-games/data-structures";

export class DataList implements IData  {
    protected _list: Map<string, IBag<string>>;
    protected _startingKeys: IBag<string>;
    protected _getBag: ()=>IBag<string>;
  
    protected _paths: {
        StartingKeys: string;
        Data: string;
    }

    constructor(getBag: (data?: Map<any, number>)=>IBag<string>) {
        this._list = undefined;
        this._startingKeys = undefined;
        this._getBag = getBag;
    }
    SetPaths(path: string) {
        this._paths = {
            StartingKeys: `${path}\\StartingKeys.json`,
            Data: `${path}\\Data.json`
        }
    }

    GetCount(sequence: string): Promise<number> {
        return Promise.resolve(this._list.has(sequence) ? this._list.get(sequence).CountContents() : 0);
    }
    async Get(sequence: string): Promise<string | undefined> {
        let results = this._list.get(sequence);
    
        // If there is no next word for this sequence, return nothing.
        if (!results) {
            return undefined;
        }
        
        return results.Pull();
    }
    Add(sequence: string, next: string): Promise<void> {
        const list = this._list;

        // If we haven't already seen this sequence, start a new list.
        if (!list.has(sequence)) {
            list.set(sequence, this._getBag());
        }

        list.get(sequence).Add(next);
        
        return;
    }
    async GetStartKey(): Promise<string> {
        return this._startingKeys.Pull();
    }
    async AddStartingKey(key: string): Promise<void> {
        this._startingKeys.Add(key);
    }

    // Connects to the file system to load the memory data.
    async Connect() {
        console.assert(this._paths !== undefined, "Chain failed to connect; no paths specified.");
        const startingKeys = await Files.LoadJson(this._paths.StartingKeys, LoadWithObjects(this._getBag));
        const dataList = await Files.LoadJson(this._paths.Data, LoadWithObjects(this._getBag));

        if (startingKeys !== undefined && dataList !== undefined) {
            this._startingKeys = startingKeys;
            this._list = dataList;
        } else if (startingKeys !== undefined || dataList !== undefined) {
            console.warn(`Found one file, but could not find the other. Failed to load Memory List from file.`);
        }

        if (!startingKeys || !dataList) {
            this._startingKeys = this._getBag();
            this._list = new Map<string, IBag<string>>();
        }
    }

    // Disconnects from the file system, stores the data from memory to file, and closes the lists.
    async Disconnect() {
        console.assert(this._paths !== undefined, "Chain failed to disconnect; could not find output path.");

        // Write the data to file
        await Files.Overwrite(this._paths.StartingKeys, JSON.stringify(this._startingKeys, SaveWithObjects));
        await Files.Overwrite(this._paths.Data, JSON.stringify(this._list, SaveWithObjects));

        // Clear memory used for the two maps
        this._startingKeys.Clear();
        for (const probabilityMap of this._list.values()) {
            probabilityMap.Clear();
        }
        this._list.clear();

        this._startingKeys = undefined;
        this._list = undefined;
    }
}