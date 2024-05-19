/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain } from "./interfaces";
import { DataList, Generate, Train } from "./src";

export class MarkovChain implements IMarkovChain {
    _chain: IData;
    constructor() {
        this._chain = new DataList();
    }
    async Train(data: string) {
        await Train(this._chain, data);
    }
    async Generate(): Promise<string> {
        return await Generate(this._chain);
    }
}