/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";
import * as Files from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";
import { MarkovChain } from "../../main";
import { CreateKeyFromSequence } from "../Helpers";

// Parses a sequence of numbers into a key for the data array.
export class DataList implements IData  {
    protected _list: Map<string, IBag<any>>;
    protected _startingKeys: IBag<any>;
    protected _getBag: ()=>Bag<any>;

    // Constructs a blank DataList.
    constructor(getBag: ()=>Bag<any>) {
        this._getBag = getBag;
        this._initializeDataList();
    }

    // Constructs a new DataList given the StartKeys + Data mapping.
    static FromData(startKeys: [any, number][], data: [string, IterableIterator<[any, number]>][], getBag: (values?: Iterable<[any, number]>)=>Bag<any>) {
        const dataList = new DataList(getBag);

        // Set the starting keys
        dataList._startingKeys = getBag(startKeys);
        
        // Build up the data list
        const list = new Map<string, IBag<any>>();
        data.forEach(([key, contents]) => {
            // Set the bag for every key - this is an array of entries, so we can just pass it directly
            list.set(key, getBag(contents));
        });
        dataList._list = list;

        return dataList;
    }

    GetCount(sequence: any[]): Promise<any> {
        const key = CreateKeyFromSequence(sequence);
        return Promise.resolve(this._list.has(key) ? this._list.get(key).CountContents() : 0);
    }
    async Get(sequence: any[]): Promise<any | undefined> {
        const key = CreateKeyFromSequence(sequence);
        let results = this._list.get(key);
    
        // If there is no next word for this sequence, return nothing.
        if (!results) {
            return undefined;
        }
        
        return results.Pull();
    }
    Add(sequence: any[], next: any): Promise<void> {
        const list = this._list;
        const key = CreateKeyFromSequence(sequence);

        // If we haven't already seen this sequence, start a new list.
        if (!list.has(key)) {
            list.set(key, this._getBag());
        }

        list.get(key).Add(next);

        return;
    }
    async GetStartKey(): Promise<any> {
        return this._startingKeys.Pull();
    }
    async AddStartingKey(key: any): Promise<void> {
        this._startingKeys.Add(key);
    }

    GetStartingKeys(): [any, number][] {
        return Array.from(this._startingKeys.Entries());
    }
    GetData(): [string, [any, number][]][] {
        const lists = [ ];
        this._list.forEach((value, key) => {
            lists.push([key, Array.from(value.Entries())]);
        })
        return lists;
    }

    
    // Initializes a new, empty data list.
    private _initializeDataList(){
        this._list = new Map<string, IBag<any>>();
        this._startingKeys = new Bag<any>();
    }
}