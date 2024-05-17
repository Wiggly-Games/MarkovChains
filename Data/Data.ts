/*
    Data is the main class which houses the data for the Markov Chain.
    It has four methods which can be run, two are for the generator, and two are for the trainer.

    For Training purposes:
        AddStartingKey(key: string) -> Adds a new key that we can use to start a chain.
        Add(sequence: string, newWord: string) -> Adds a new word that comes from a sequence.
            For example, if sequence is written as "A dog", and newWord is "walked", this will point "A dog" towards "walked".
        
    For Generating:
        GetStartKey(): string -> Returns a random word that we can use to start off a new sequence.
        Get(sequence: string): string | undefined -> Returns the next word that can be built from the preceding sequence, 
         or undefined if no words can be found from the sequence.
*/


let list: Map<string, string[]> = new Map<string, string[]>();
let startingKeys: Map<string, number> = new Map<string, number>();

// Gets a new word given a starting sequence.
export async function Get(sequence: string): Promise<string | undefined> {
    let results = list[sequence];

    // If there is no next word for this sequence, return nothing.
    if (!results) {
        return undefined;
    }

    // Otherwise, we can pick a random word from our list.
    // NOTE: We may want to fix this later with probabilities instead, to save memory.
    return results[Math.floor(Math.random() * results.length)];
}

// Adds to our main chain, taking a starting sequence with the word that the chain connects to.
export async function Add(sequence: string, newWord: string) {
    // If we haven't already seen this sequence, start a new list.
    if (!(sequence in list)) {
        list[sequence] = [ ];
    }

    // Add the word after our sequence
    list[sequence].push(newWord);
}


// Adds to our list of starting words, that can be used to start a sequence.
export async function AddStartingKey(key: string): Promise<void> {
    // If we've seen this key already, increment the number of times we've seen it.
    // If not, set it to 1, as we've only seen it once.
    if (key in startingKeys) {
        startingKeys[key] ++;
    } else {
        startingKeys[key] = 1;
    }
}

// Gets a random word that we can use to start a new sequence.
export async function GetStartKey(): Promise<string | undefined> {
    // This function returns a random word from our list of starting keys, using the probability of each word of occuring.
    // See: "notes.ts" for more about the logic here.


    // 1. We need to create a list of all the keys that we've seen with their probabilities of occurring.
    let counter = 0;
    let list = [ ];
    for (const [key, numberSeen] of Object.entries(startingKeys)){
        counter += numberSeen;
        list.push({
            size: counter,
            key: key
        });
    }

    // 2. Pick a random number from 0 - Counter-1
    let rand = Math.floor(Math.random() * counter)

    // Walk through the list until we find the first key where size > our random number.
    let index = 0;
    while (index < list.length && list[index].size <= rand) {
        index ++;
    }

    // Return the element at this index.
    return index >= list.length ? undefined : list[index].key;
}