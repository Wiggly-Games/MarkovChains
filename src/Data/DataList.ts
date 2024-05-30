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
        Root: string;
    }

    protected _isConnected: boolean;
    protected _connectedPath: string;
    protected _hasChanged: boolean;

    constructor(getBag: (data?: Map<any, number>)=>IBag<string>) {
        this._list = undefined;
        this._startingKeys = undefined;
        this._getBag = getBag;
    }
    SetPaths(path: string) {
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
        
        // Note: The chain data has changed, make a note so that we save it later
        // Ideally, we'd change this to a list that has events. But. For now this is that
        this._hasChanged = true;

        return;
    }
    async GetStartKey(): Promise<string> {
        return this._startingKeys.Pull();
    }
    async AddStartingKey(key: string): Promise<void> {
        this._startingKeys.Add(key);

        // Chain data has changed, make a note so we can save it later
        this._hasChanged = true;
    }

    // Connects to the file system to load the memory data.
    async Connect() {
        console.assert(this._paths !== undefined, "Chain failed to connect; no paths specified.");

        if (this._isConnected && this._connectedPath === this.GetPaths()) {
            // Already connected to the same training set, don't need to reload
            return;
        } else if (this._isConnected) {
            // In this case we're connected, but it's to a different data set
            // Unload before setting up our new data
            await this.Disconnect();
        }
        
        // Update the connection
        this._isConnected = true;
        this._connectedPath = this.GetPaths();
        this._hasChanged = false;

        // Load our chain data
        const startingKeys = await Files.LoadJson(this._paths.StartingKeys, LoadWithObjects(this._getBag));
        const dataList = await Files.LoadJson(this._paths.Data, LoadWithObjects(this._getBag));

        // Note: We have to find both files; if we can't, this will throw an error
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
        // If the training data has changed, save it back to file
        if (this._hasChanged) {
            await this.SaveToFile();
            this._hasChanged = false;
        }

        // Clear memory used for the two maps
        this._startingKeys.Clear();
        for (const probabilityMap of this._list.values()) {
            probabilityMap.Clear();
        }
        this._list.clear();

        this._startingKeys = undefined;
        this._list = undefined;
        this._isConnected = false;
    }

    // Saves the chain's data to a file.
    protected async SaveToFile(){
        console.assert(this._paths !== undefined, "Failed to save to file because no path was specified.");

        await Files.Overwrite(this._paths.StartingKeys, JSON.stringify(this._startingKeys, SaveWithObjects));
        await Files.Overwrite(this._paths.Data, JSON.stringify(this._list, SaveWithObjects));
    }
}