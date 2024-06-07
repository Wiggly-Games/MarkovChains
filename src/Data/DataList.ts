/*
    DataList implements IData into a simple list within memory.
*/

import { IData } from "../../interfaces";
import * as Files from "@wiggly-games/files";
import { LoadWithObjects, SaveWithObjects } from "../Helpers";
import { Bag, IBag } from "@wiggly-games/data-structures";

export class DataList implements IData  {
    protected _list: Map<string, IBag<string>>;
    protected _startingKeys: IBag<string>;
    protected _getBag: ()=>IBag<string>;
  
    protected _paths: {
        StartingKeys: string;
        Data: string;
        Root: string;
    }

    protected _connectedPath: string;
    protected _isConnected: boolean;

    constructor(path: string, getBag: (data?: Map<any, number>)=>IBag<string>) {
        this._getBag = getBag;
        this._isConnected = false;
        this._initializeDataList();

        this._paths = {
            StartingKeys: `${path}\\StartingKeys.json`,
            Data: `${path}\\Data.json`,
            Root: path
        }        
    }
    GetPaths(): string {
        return this._paths.Root;
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
        // If we've already connected to the same path, then we have no work to do
        if (this._isConnected && this._connectedPath === this.GetPaths()) {
            return;
        } else if (this._isConnected) {
            // In this case we're connected, but it's to a different data set
            // Disconnect and change our data path
            await this.Disconnect();
        }
        
        // Update the connection
        this._connectedPath = this.GetPaths();
        this._isConnected = true;
    }

    // Disconnects from the file system, stores the data from memory to file, and closes the lists.
    async Disconnect() {
        // Clear memory used for the two maps
        this._startingKeys.Clear();
        for (const probabilityMap of this._list.values()) {
            probabilityMap.Clear();
        }
        this._list.clear();

        this._isConnected = false;
        this._initializeDataList();
    }

    // Load the chain data from file
    async Load(): Promise<void> {
        console.assert(this._paths !== undefined, "Chain failed to connect; no paths specified.");

        // Load our chain data
        const startingKeys = await Files.LoadJson(this._paths.StartingKeys, LoadWithObjects(this._getBag));
        const dataList = await Files.LoadJson(this._paths.Data, LoadWithObjects(this._getBag));

        // Note: We have to find both files; if we can't, this will throw an error
        if (startingKeys !== undefined && dataList !== undefined) {
            this._startingKeys = startingKeys;
            this._list = dataList;
        } else {
            throw `Could not load data from file path: ${this._paths.Root}`;
        }
    }

    // Saves the latest chain data into a file.
    async Save() {
        await this.SaveToFile();
    }

    // Saves the chain's data to a file.
    protected async SaveToFile(){
        console.assert(this._paths !== undefined, "Failed to save to file because no path was specified.");

        await Files.Overwrite(this._paths.StartingKeys, JSON.stringify(this._startingKeys, SaveWithObjects));
        await Files.Overwrite(this._paths.Data, JSON.stringify(this._list, SaveWithObjects));
    }
    
    // Initializes a new, empty data list.
    private _initializeDataList(){
        this._list = new Map<string, IBag<string>>();
        this._startingKeys = new Bag<string>();
    }
}