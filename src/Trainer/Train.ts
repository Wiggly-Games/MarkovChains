/*
    This returns a function which trains the Data given a training set.
    The training set should be a mix of sentences, which can be separated by:
        - new lines
        - periods
        - question marks
        - exclamation marks
    
    Once Train is completed, the list should be ready to be generated from.
*/



import { IData } from "../../interfaces";
import { JoinWords, SplitSentences, SplitWords } from "../Helpers";
import { Backoff, MaxChainLength } from "../../Configuration.json";

// Adds the sequence to our data set.
// Given the index of the new word to add, the total number of words that builds up a single sequence, and whether or not to apply backoff.
async function addToData(data: IData, sequence: string[], index: number, maxChainLength: number, backoff: boolean) {
    if (maxChainLength === 0) {
        return;
    }

    // Our chain can be at most the number of words we've seen so far.
    // For example, if we're on word index 1, then we've seen one word; our max chain length would be the 1 word we've seen so far.
    // As example: "A dog walks fast", index 2 (walks): Our max chain size is "A dog", which is 2.
    if (maxChainLength > index) {
        maxChainLength = index;
    }

    // Starting has to be at least 0, and the max length is maxChainLength - so at most we take that many words until our index.
    // We don't want this to include our new word, so we end at index.
    // As an example: "I am a dog and I go woof", index is 6: Starting is 1; "am a dog and I", excluding index 6 (go).
    let totalSequence = sequence.slice(Math.max(0, index - maxChainLength), index);
    let nextWord = sequence[index];

    await data.Add(JoinWords(totalSequence), nextWord);

    // If we're performing backoff, shorten the string
    if (backoff) {
        addToData(data, sequence, index, maxChainLength - 1, backoff);
    }
}

// Performs the training, given a set to train against.
export async function Train(data: IData, trainingSet: string) {
    // Start off by connecting to the file system.
    data.Connect();

    // Split up our sequences into separate sentences to be trained against.
    const sequences = SplitSentences(trainingSet);

    // The number of words that builds up a single sequence.
    const maxChainLength = MaxChainLength;

    // Whether or not we want to shorten sequences to give a wider variety of options.
    const backoff = Backoff;

    // Create a set of Promises to train against each sequence,
    // Then wait for all the sequences to complete
    await Promise.all(sequences.map(sequence => {
        return new Promise<void>(async (fulfill) => {
            // Split the sequence into separate words
            let words = SplitWords(sequence);

            // The first word can be used to start a new sequence.
            await data.AddStartingKey(words[0]);

            // Go through every word to add it to our chain.
            for (let i = 1; i < words.length; i++) {
                // From here, we train against the last X words.
                await addToData(data, words, i, maxChainLength, backoff);
            }

            fulfill();
        });
    }));

    // Disconnect, save everything to file, clean up memory.
    await data.Disconnect();
}