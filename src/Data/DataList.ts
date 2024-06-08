/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";
import * as Files from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";
import { MarkovChain } from "../../main";

export class DataList implements IData  {
    protected _list: Map<string, IBag<string>>;
    protected _startingKeys: IBag<string>;
    protected _getBag: ()=>Bag<string>;

    // Constructs a blank DataList.
    constructor(getBag: ()=>Bag<string>) {
        this._getBag = getBag;
        this._initializeDataList();
    }

    // Constructs a new DataList given the StartKeys + Data mapping.
    static FromData(startKeys: [string, number][], data: [string, IterableIterator<[string, number]>][], getBag: (values?: Iterable<[string, number]>)=>Bag<string>) {
        const dataList = new DataList(getBag);

        // Set the starting keys
        dataList._startingKeys = getBag(startKeys);
        
        // Build up the data list
        const list = new Map<string, IBag<string>>();
        data.forEach(([key, contents]) => {
            // Set the bag for every key - this is an array of entries, so we can just pass it directly
            list.set(key, getBag(contents));
        });
        dataList._list = list;

        return dataList;
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

    GetStartingKeys(): [string, number][] {
        return Array.from(this._startingKeys.Entries());
    }
    GetData(): [string, [string, number][]][] {
        const lists = [ ];
        this._list.forEach((value, key) => {
            lists.push([key, Array.from(value.Entries())]);
        })
        return lists;
    }

    
    // Initializes a new, empty data list.
    private _initializeDataList(){
        this._list = new Map<string, IBag<string>>();
        this._startingKeys = new Bag<string>();
    }
}