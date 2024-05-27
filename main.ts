/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain } from "./interfaces";
import { DataList, Generate, Train } from "./src";
import { CreateDirectory } from "@wiggly-games/files";
import { Bag } from "@wiggly-games/data-structures";

export class MarkovChain implements IMarkovChain {
    _chain: IData;
    constructor() {
        // Create the data list
        this._chain = new DataList((data?: Map<any, number>)=>new Bag(data));
    }
    async Train(data: string, outputPath: string) {
        this.SetPaths(outputPath);
        await Train(this._chain, data);
    }
    async Generate(inputPath: string): Promise<string> {
        this.SetPaths(inputPath);
        return await Generate(this._chain);
    }

    // Sets the path to the folder to be used for persistent storage within the chain.
    protected SetPaths(path: string) {
        // If the directory doesn't already exist, create a new one
        CreateDirectory(path);

        // Set the path to be used by the chain
        this._chain.SetPaths(path);
    }
}