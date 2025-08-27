/*
    Markov Chain interface.

    Markov Chain takes in any type of data (through the T variable),
    then can train/generate new values based on that origin data.
*/

export interface IMarkovChain<T> {
    Train(data: T[][]): Promise<void>;
    Generate(startingSequence?: T[] | undefined): Promise<T[]>;
}