/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";

export class DataList implements IData {
    protected _list: Map<string, string[]>;
    protected _startingKeys: Map<string, number>;
    
    constructor() {
        this._list = new Map<string, string[]>();
        this._startingKeys = new Map<string, number>();
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
}