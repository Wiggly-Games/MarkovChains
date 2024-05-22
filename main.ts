/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain } from "./interfaces";
import { DataList, Generate, Train, CreateDirectory } from "./src";
import { ProbabilityMap } from "./src";

export class MarkovChain implements IMarkovChain {
    _chain: IData;
    constructor(path: string) {
        // If the directory doesn't already exist, create a new one
        CreateDirectory(path);

        // Create the data list
        this._chain = new DataList(path, (data?: Map<any, number>)=>new ProbabilityMap(data));
    }
    async Train(data: string) {
        await Train(this._chain, data);
    }
    async Generate(): Promise<string> {
        return await Generate(this._chain);
    }
}