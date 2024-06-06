/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain } from "./interfaces";
import { DataList, Generate, Train, TConfiguration } from "./src";
import { CreateDirectory } from "@wiggly-games/files";
import { Bag } from "@wiggly-games/data-structures";
import { TConfiguration } from "./src/Types/TConfiguration";

export { TConfiguration as ChainConfiguration } from "./src";

export class MarkovChain implements IMarkovChain {
    _chain: IData;
    _configuration: TConfiguration;
    constructor(inputPath: string, configuration: TConfiguration) {
        // If the directory doesn't already exist, create a new one
        CreateDirectory(inputPath);

        // Create the data list
        this._chain = new DataList(inputPath, (data?: Map<any, number>)=>new Bag(data));
        this._configuration = configuration;
    }
    async Train(data: string) {
        await Train(this._chain, data, this._configuration);
    }
    async Generate(): Promise<string> {
        return await Generate(this._chain, this._configuration);
    }

    async Load(){
        await this._chain.Load();
    }
    async Save(){
        await this._chain.Save();
    }
}