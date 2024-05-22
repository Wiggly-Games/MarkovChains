/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";
import { Arrays } from "../Helpers"

export class MemoryData implements IData {
    protected _list: Map<string, string[]>;
    protected _startingKeys: Map<string, number>;
    
    constructor() {
        this._list = new Map<string, string[]>();
        this._startingKeys = new Map<string, number>();
    }
    async GetCount(sequence: string): Promise<number> {
        return this._list.has(sequence) ? this._list.get(sequence).length : 0;
    }
    async Get(sequence: string): Promise<string | undefined> {
        let results = this._list.get(sequence);
        return Arrays.GetRandom(results);
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
        const startingKeys = Object.entries(this._startingKeys);
        return Arrays.GetRandomFromProbabilities(startingKeys, (x)=>x[1])?.at(0);
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

    async Connect(): Promise<void> { }
    async Disconnect(): Promise<void> { }
}