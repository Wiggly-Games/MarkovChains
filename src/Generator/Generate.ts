import { IData } from "../../interfaces";
import { GetEndSequence } from "../Helpers";

// Gets the max chain length that we can use to generate the target number of options.
async function GetChainLength(data: IData, sequence: any[], chainLength: number, minChainLength: number, minWordsToSelect: number): Promise<number>
{
    // Check first maxChainLength words from the end of the sequence, if the count is bigger than minWords, we select one from that sequence.
    // Otherwise, drop chain length by 1, and repeat. End if we hit 1 word. Return the result.
    while (chainLength > minChainLength) {
        let numOptions = await data.GetCount(GetEndSequence(sequence, chainLength));

        // If we have enough options, take a chain of this length.
        if (numOptions >= minWordsToSelect) {
            break;
        }

        // If not, perform backoff and take one fewer word.
        chainLength --;
    }

    return chainLength;
}

// Retrieves a word based on the preceding sequence, while performing backoff.
async function getNextValue(data: IData, sequence: any[], maxChainLength: number, minChainLength: number,
    backoff: boolean, minWordsToSelect: number, stopAtFewerOptions: boolean): Promise<any | undefined>
{
    // If we're performing backoff, get the chain length. Otherwise, it gets set to maxChainLength.
    let chainLength = Math.min(sequence.length, maxChainLength);

    // If we're performing backoff, reduce the chain length as needed until we hit the target number of words.
    if (backoff) {
        chainLength = await GetChainLength(data, sequence, chainLength, minChainLength, minWordsToSelect);
    }

    if (stopAtFewerOptions) {
        const options = await data.GetCount(GetEndSequence(sequence, chainLength));
        if (options < minWordsToSelect) {
            return undefined;
        }   
    }

    return await data.Get(GetEndSequence(sequence, chainLength));
}

export async function Generate(data: IData, {WordCount, MinRequiredOptions, Backoff, MinBackoffLength, TrainingLength, StopAtFewerOptions}): Promise<any[]> {
    // 1. We need to pick a starting key.
    // 2. Until we reach a certain number of words, sequences, or we end up looping; generate a new word.
    //      - We want a certain number of options available, and if we don't reach that number, we perform backoff.

    // Get a starting key
    const sequence = [ ];
    let startKey = await data.GetStartKey(); 

    // If we don't have any starting keys, throw an error.
    if (startKey === undefined) {
        throw "Could not generate from data; no starting keys were found.";
    }

    // Start off the sequence
    sequence.push(startKey);

    // Generate words
    while (sequence.length < WordCount) {
        const nextWord = await getNextValue(data, sequence, TrainingLength, MinBackoffLength, Backoff, MinRequiredOptions, StopAtFewerOptions);
        
        // If we didn't find any words, exit here
        if (nextWord === undefined) {
            break;
        }

        // Add the word to the end of our sequence
        sequence.push(nextWord);
    }

    // Return our result
    return sequence;
}