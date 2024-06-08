/*
    IData is the main interface which houses the data for the Markov Chain.
    It has four methods which can be run, two are for the generator, and two are for the trainer.

    For Training purposes:
        AddStartingKey(key: string) -> Adds a new key that we can use to start a chain.
        Add(sequence: string, newWord: string) -> Adds a new word that comes from a sequence.
            For example, if sequence is written as "A dog", and newWord is "walked", this will point "A dog" towards "walked".
        
    For Generating:
        GetStartKey(): string -> Returns a random word that we can use to start off a new sequence.
        Get(sequence: string): string | undefined -> Returns the next word that can be built from the preceding sequence, 
         or undefined if no words can be found from the sequence.
        GetCount(sequence: string): number -> Returns the number of words that can be linked from the preceding sequence.

    For Persistence:
        SetPaths(path: string): Sets a folder directory where will be loaded/unloaded from.
        GetPaths(): Gets the folder directory where content is being loaded/unloaded from.
        
        Connect(): Connects to file to load in data.
        Disconnect(): Disconnects, cleans up memory use, and saves everything to file.

        Save(): Saves everything to file, without removing the data from memory.
        Load(): Loads the data from a file, allowing it to be used for generating chains.
*/

import { IBag } from "@wiggly-games/data-structures";

export interface IData {
    GetCount(sequence: string): Promise<number>;
    Get(sequence: string): Promise<string | undefined>;
    Add(sequence: string, next: string): Promise<void>;

    GetStartKey(): Promise<string>;
    AddStartingKey(key: string): Promise<void>;

    GetStartingKeys(): [string, number][];
    GetData(): [string, [string, number][]][];
}