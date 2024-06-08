/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain } from "./interfaces";
import { DataList, Generate, Train, TConfiguration } from "./src";
import { CreateDirectory, ReadFile, Overwrite } from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";

export { TConfiguration as ChainConfiguration } from "./src";

const getData = (root: string) => `${root}/Data.json`;
const getStartingKeys = (root: string) => `${root}/StartingKeys.json`
// Export the class
export class MarkovChain implements IMarkovChain {
    _chain: IData;
    _configuration: TConfiguration;
    _root: string;

    constructor(inputPath: string, configuration: TConfiguration) {
        this._chain = new DataList(()=>new Bag());
        this._configuration = configuration;
        this._root = inputPath;
    }

    // Trains new data into the chain.
    async Train(data: string) {
        await Train(this._chain, data, this._configuration);
    }

    // Generates data from the chain.
    async Generate(): Promise<string> {
        return await Generate(this._chain, this._configuration);
    }

    // Loads existing chain data from a file.
    async Load(){
        const data = JSON.parse(await ReadFile(getData(this._root)));
        const startingKeys = JSON.parse(await ReadFile(getStartingKeys(this._root)));

        this._chain = DataList.FromData(startingKeys, data, (...args)=>new Bag(...args));
    }

    // Saves the trained chain data to a file.
    async Save(){
        await CreateDirectory(this._root);

        await Overwrite(getData(this._root), JSON.stringify(this._chain.GetData()));
        await Overwrite(getStartingKeys(this._root), JSON.stringify(this._chain.GetStartingKeys()));
    }
}