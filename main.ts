/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain, ITypeMapping } from "./interfaces";
import { DataList, Generate, Train, TConfiguration } from "./src";
import { CreateDirectory, WithReadStream, Overwrite } from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";
import { Encoder, Decoder } from "@msgpack/msgpack";
import { TypeMapping } from "./src/Mapping";

export { TConfiguration as ChainConfiguration } from "./src";

const getData = (root: string) => `${root}/Data.msgpack`;
const getStartingKeys = (root: string) => `${root}/StartingKeys.msgpack`
const getMapping = (root: string) => `${root}/Mapping.msgpack`

const encoder = new Encoder();
const decoder = new Decoder();

// Export the class
export class MarkovChain<T> implements IMarkovChain<T> {
    _chain: IData;
    _configuration: TConfiguration;
    _mapping: ITypeMapping<T>;
    _root: string;

    constructor(inputPath: string, configuration: TConfiguration) {
        this._chain = new DataList(()=>new Bag());
        this._mapping = new TypeMapping<T>();
        this._configuration = configuration;
        this._root = inputPath;
    }

    // Trains new data into the chain.
    async Train(data: T[][]) {
        // Add any new values into the data mapping
        this._mapping.Update(data.flat());

        // Convert the input data into its numerical representations,
        // Then train our chain against the number values
        const input = this.ConvertInputData(data);
        await Train(this._chain, input, this._configuration);
    }

    // Generates data from the chain.
    async Generate(): Promise<T[]> {
        // Retrieve the numerical representation values
        const output = await Generate(this._chain, this._configuration);

        // Build them up into the actual data values, so that we can return it to the user
        // in their expected format
        return this.ParseOutputData(output);
    }

    // Loads existing chain data from a file.
    async Load(){
        const data = await WithReadStream(getData(this._root), (s) => decoder.decodeAsync(s)) as any;
        const startingKeys = await WithReadStream(getStartingKeys(this._root), (s) => decoder.decodeAsync(s)) as any;
        const mapping = await WithReadStream(getMapping(this._root), (s) => decoder.decodeAsync(s)) as any;

        this._chain = DataList.FromData(startingKeys, data, (...args)=>new Bag(...args));
        this._mapping.Set(mapping);
    }

    // Saves the trained chain data to a file.
    async Save(){
        await CreateDirectory(this._root);

        await Overwrite(getData(this._root), encoder.encode(this._chain.GetData()));
        await Overwrite(getStartingKeys(this._root), encoder.encode(this._chain.GetStartingKeys()));
        await Overwrite(getMapping(this._root), encoder.encode(this._mapping.GetAllValues()));
    }

    // Given the data values, converts to a list of numbers for internal use.
    private ConvertInputData(input: T[][]): number[][] {
        const result = [ ];
        input.forEach((inputSet) => {
            const next = [ ];
            inputSet.forEach(value => {
                next.push(this._mapping.GetValue(value));
            })
            result.push(next);
        });
        return result;
    }

    // Given a list of numbers, returns the data value representation.
    private ParseOutputData(output: number[]): T[] {
        const result = [];
        output.forEach(value => {
            result.push(this._mapping.Parse(value));
        });
        return result;
    }
}