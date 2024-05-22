/*
    DataList implements IData into a simple list within memory.
*/

import { IData, IProbabilityMap } from "../../interfaces";
import * as Files from "../Files";
import { LoadWithProbabilityMap, SaveWithMaps } from "../Helpers";

export class DataList implements IData  {
    protected _list: Map<string, IProbabilityMap<string>>;
    protected _startingKeys: IProbabilityMap<string>;
    protected _getProbabilityMap: ()=>IProbabilityMap<string>;
  
    protected _paths: {
        StartingKeys: string;
        Data: string;
    }

    constructor(path: string, getProbabilityMap: (data?: Map<any, number>)=>IProbabilityMap<string>) {
        this._list = undefined;
        this._startingKeys = undefined;
        this._getProbabilityMap = getProbabilityMap;

        this._paths = {
            StartingKeys: `${path}\\StartingKeys.json`,
            Data: `${path}\\Data.json`
        }
    }
    GetCount(sequence: string): Promise<number> {
        return Promise.resolve(this._list.has(sequence) ? this._list.get(sequence).GetCount() : 0);
    }
    async Get(sequence: string): Promise<string | undefined> {
        let results = this._list.get(sequence);
    
        // If there is no next word for this sequence, return nothing.
        if (!results) {
            return undefined;
        }
        
        return results.GetRandom();
    }
    Add(sequence: string, next: string): Promise<void> {
        const list = this._list;

        // If we haven't already seen this sequence, start a new list.
        if (!list.has(sequence)) {
            list.set(sequence, this._getProbabilityMap());
        }

        list.get(sequence).Add(next);
        
        return;
    }
    async GetStartKey(): Promise<string> {
        return this._startingKeys.GetRandom();
    }
    async AddStartingKey(key: string): Promise<void> {
        this._startingKeys.Add(key);
    }

    // Connects to the file system to load the memory data.
    async Connect() {
        const startingKeys = await Files.LoadJson(this._paths.StartingKeys, LoadWithProbabilityMap(this._getProbabilityMap));
        const dataList = await Files.LoadJson(this._paths.Data, LoadWithProbabilityMap(this._getProbabilityMap));

        if (startingKeys !== undefined && dataList !== undefined) {
            this._startingKeys = startingKeys;
            this._list = dataList;
        } else if (startingKeys !== undefined || dataList !== undefined) {
            console.warn(`Found one file, but could not find the other. Failed to load Memory List from file.`);
        }

        if (!startingKeys || !dataList) {
            this._startingKeys = this._getProbabilityMap();
            this._list = new Map<string, IProbabilityMap<string>>();
        }
    }

    // Disconnects from the file system, stores the data from memory to file, and closes the lists.
    async Disconnect() {
        // Write the data to file
        await Files.Overwrite(this._paths.StartingKeys, JSON.stringify(this._startingKeys, SaveWithMaps));
        await Files.Overwrite(this._paths.Data, JSON.stringify(this._list, SaveWithMaps));

        // Clear memory used for the two maps
        this._startingKeys.Clear();
        for (const probabilityMap of this._list.values()) {
            probabilityMap.Clear();
        }
        this._list.clear();

        this._startingKeys = undefined;
        this._list = undefined;
    }

    // Connects to the file system to load the memory data.
    async Connect() {
        const startingKeys = await Files.LoadJson(this._paths.StartingKeys, LoadWithMaps);
        const dataList = await Files.LoadJson(this._paths.Data, LoadWithMaps);

        if (startingKeys !== undefined && dataList !== undefined) {
            this._startingKeys = startingKeys;
            this._list = dataList;
        } else if (startingKeys !== undefined || dataList !== undefined) {
            console.warn(`Found one file, but could not find the other. Failed to load Memory List from file.`);
        }
    }

    // Disconnects from the file system, stores the data from memory to file, and closes the lists.
    async Disconnect() {
        // Write the data to file
        await Files.Overwrite(this._paths.StartingKeys, JSON.stringify(this._startingKeys, SaveWithMaps));
        await Files.Overwrite(this._paths.Data, JSON.stringify(this._list, SaveWithMaps));

        // Clear memory used for the two maps
        this._startingKeys.clear();
        this._list.clear();
    }
}