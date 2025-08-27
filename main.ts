/*
    Main library for the Markov Chain text generator.
*/

import { IData, IMarkovChain, ITypeMapping } from "./interfaces";
import { DataList, Generate, Train, TConfiguration, TInternal } from "./src";
import { CreateDirectory, WithWriteStream } from "@wiggly-games/files";
import { Bag, IBag } from "@wiggly-games/data-structures";
import { TypeMapping } from "./src/Mapping";
import { Reader } from "@wiggly-games/node-readline";

export { TConfiguration as ChainConfiguration } from "./src";

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
    async Generate(startingSequence?: T[] | undefined): Promise<T[]> {
        // if a starting sequence isn't passed in, initialize it with an empty array
        if (startingSequence === undefined) {
            startingSequence = [];
        }

        // convert the data into the internal format
        this._mapping.Update(startingSequence);
        let initData = this.ConvertInputSet(startingSequence);

        // Retrieve the numerical representation values
        const output = await Generate(this._chain, this._configuration, initData);

        // Build them up into the actual data values, so that we can return it to the user
        // in their expected format
        return this.ParseOutputData(output);
    }

    // Loads existing chain data from a file.
    async Load(parse: (dataString: string)=>T){
        await this._chain.Load(`${this._root}/Data`);

        // Read all the mapping values
        const reader = new Reader(`${this._root}/Mapping`);
        const values = [];
        while (reader.HasNextLine()){
            values.push(parse(reader.ReadLine()));
        }
        this._mapping.Set(values);
    }

    // Saves the trained chain data to a file.
    async Save(stringify: (key: T)=>string){
        await CreateDirectory(this._root);
        await this._chain.Save(`${this._root}/Data`);

        // Save all the mapping values into a separate file
        await WithWriteStream(`${this._root}/Mapping`, (stream)=>{
            this._mapping.GetAllValues().forEach(value => {
                stream.write(stringify(value) + "\n");
            });
            return undefined;
        })
    }

    // Given the data values, converts to a list of numbers for internal use.
    private ConvertInputData(input: T[][]): number[][] {
        const result = [ ];
        input.forEach((inputSet) => {
            result.push(this.ConvertInputSet(inputSet));
        });
        return result;
    }
    private ConvertInputSet(input: T[]): number[] {
        const result = [ ];
        input.forEach(value => {
            result.push(this._mapping.GetValue(value));
        });
        return result;
    }

    // Given a list of numbers, returns the data value representation.
    private ParseOutputData(output: TInternal[]): T[] {
        const result = [];
        output.forEach(value => {
            result.push(this._mapping.Parse(value));
        });
        return result;
    }
}