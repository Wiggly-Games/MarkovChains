/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain, IStringify } from "./interfaces";
import { DataList, Generate, Train, TConfiguration } from "./src";
import { CreateDirectory, ReadFile, Overwrite } from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";
import { JsonStringifier } from "./src/DataStringifier/JsonStringifier";

export { TConfiguration as ChainConfiguration } from "./src";

type DataListMap = {
    StartingKeys: IBag<string>,
    Data: Map<string, IBag<string>>
};

// Create our JSON stringifier/parser.
const json : IStringify<IData> = new JsonStringifier<IData>();
json.AddClassDefinition(Map, (data: Map<any, any>)=>Array.from(data.entries()), (data:any)=>new Map(data));
json.AddClassDefinition(Bag, (data: Bag<any>)=>Array.from(data.ConvertToMap().entries()), (data:any)=>new Bag(data));
json.AddClassDefinition(DataList, (data: DataList) => {
    return {
        StartingKeys: data.GetStartingKeys(),
        Data: data.GetData()
    }
}, (data: DataListMap) => {
    return DataList.FromData(data.StartingKeys, data.Data, () => new Bag());
});

// Export the class
export class MarkovChain implements IMarkovChain {
    _chain: IData;
    _configuration: TConfiguration;
    _path: string;

    constructor(inputPath: string, configuration: TConfiguration) {
        this._chain = new DataList(()=>new Bag());
        this._configuration = configuration;
        this._path = `${inputPath}.json`;
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
        this._chain = json.Parse(await ReadFile(this._path));
    }

    // Saves the trained chain data to a file.
    async Save(){
        const data = json.Stringify(this._chain);
        await Overwrite(this._path, data);
    }
}