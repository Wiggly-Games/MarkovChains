/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain } from "./interfaces";
import { Generate, MemoryData, PersistentData, Train} from "./src";

export class MarkovChain implements IMarkovChain {
    _chain: IData;
    constructor(path?: string | undefined) {
        this._chain = (path !== undefined) ? new PersistentData(path) : new MemoryData();
    }
    async Train(data: string) {
        await Train(this._chain, data);
    }
    async Generate(): Promise<string> {
        return await Generate(this._chain);
    }
}