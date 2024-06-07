/*
    DataList implements IData into a simple list within memory.
*/

import { IData, IStringify } from "../../interfaces";
import * as Files from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";
import { MarkovChain } from "../../main";

export class DataList implements IData  {
    protected _list: Map<string, IBag<string>>;
    protected _startingKeys: IBag<string>;
    protected _stringifier: IStringify<IData>;
    protected _getBag: ()=>Bag<string>;

    // Constructs a blank DataList.
    constructor(getBag: ()=>Bag<string>) {
        this._getBag = getBag;
        this._initializeDataList();
    }

    // Constructs a new DataList given the StartKeys + Data mapping.
    static FromData(startKeys: IBag<string>, data: Map<string, IBag<string>>, getBag: ()=>Bag<string>) {
        const dataList = new DataList(getBag);
        dataList._list = data;
        dataList._startingKeys = startKeys;

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

    GetStartingKeys(): IBag<string> {
        return this._startingKeys;
    }
    GetData(): Map<string, IBag<string>> {
        return this._list;
    }

    // Initializes a new, empty data list.
    private _initializeDataList(){
        this._list = new Map<string, IBag<string>>();
        this._startingKeys = new Bag<string>();
    }
}