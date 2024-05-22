/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";
import * as Files from "../Files";
import { LoadWithMaps, SaveWithMaps } from "../Helpers/Json";

export class DataList implements IData {
    protected _list: Map<string, string[]>;
    protected _startingKeys: Map<string, number>;
    
    protected _paths: {
        StartingKeys: string;
        Data: string;
    }

    constructor(path: string) {
        this._list = new Map<string, string[]>();
        this._startingKeys = new Map<string, number>();

        this._paths = {
            StartingKeys: `${path}\\StartingKeys.json`,
            Data: `${path}\\Data.json`
        }
    }
    GetCount(sequence: string): Promise<number> {
        return Promise.resolve(this._list.has(sequence) ? this._list.get(sequence).length : 0);
    }
    Get(sequence: string): Promise<string | undefined> {
        let results = this._list.get(sequence);
    
        // If there is no next word for this sequence, return nothing.
        if (!results) {
            return undefined;
        }
    
        // Otherwise, we can pick a random word from our list.
        // NOTE: We may want to fix this later with probabilities instead, to save memory.
        return Promise.resolve(results[Math.floor(Math.random() * results.length)]);
    }
    Add(sequence: string, next: string): Promise<void> {
        const list = this._list;

        // If we haven't already seen this sequence, start a new list.
        if (!list.has(sequence)) {
            list.set(sequence, []);
        }

        list.get(sequence).push(next);
        
        return;
    }
    GetStartKey(): Promise<string> {
        const startingKeys = this._startingKeys;

        // This function returns a random word from our list of starting keys, using the probability of each word of occuring.
        // See: "notes.ts" for more about the logic here.
        
        // 1. We need to create a list of all the keys that we've seen with their probabilities of occurring.
        let counter = 0;
        let list = [ ];
        for (const [key, numberSeen] of startingKeys.entries()){
            counter += numberSeen;
            list.push({
                size: counter,
                key: key
            });
        }
    
        // 2. Pick a random number from 0 - Counter-1
        let rand = Math.floor(Math.random() * counter)
    
        // Walk through the list until we find the first key where size > our random number.
        let index = 0;
        while (index < list.length && list[index].size <= rand) {
            index ++;
        }
    
        // Return the element at this index.
        return index >= list.length ? undefined : list[index].key;
    }
    AddStartingKey(key: string): Promise<void> {
        const startingKeys = this._startingKeys;
        
        // If we've seen this key already, increment the number of times we've seen it.
        // If not, set it to 1, as we've only seen it once.
        if (startingKeys.has(key)) {
            startingKeys.set(key, startingKeys.get(key) + 1);
        } else {
            startingKeys.set(key, 1);
        }

        return;
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