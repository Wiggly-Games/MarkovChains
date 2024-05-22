/*
    Implements helper methods for Arrays:
        - Removes all empty strings from a list of strings
        - Retrieves the ending sequence from a chain, given the length of words to include.
*/

export const ClearBlanks = (x: string[]) => x.filter(x => x !== "");
export const GetEndSequence = (sequence: string[], chainLength: number) => sequence.slice(-chainLength);
export const GetRandom = (items: any[]) => {
    // If there are no items, return undefined.
    if (!items || items.length === 0) {
        return undefined;
    }
    // Otherwise, pick one at random.
    return items[Math.floor(Math.random() * items.length)];
}

// Return an element from an array, given an odds function for how likely each element is to occur.
export function GetRandomFromProbabilities<T>(elements: T[], getOdds: (T)=>number): T {    
    if (elements.length === 0) {
        return undefined;
    }

    // 1. We need to create a list of all the keys that we've seen with their probabilities of occurring.
    let counter = 0;
    let list = [ ];
    for (const element of elements){
        counter += getOdds(element);
        list.push({
            size: counter,
            element: element
        });
    }

    // 2. Pick a random number from 0 - Counter-1
    let rand = Math.floor(Math.random() * counter)

    // Walk through the list until we find the first key where size > our random number.
    let index = 0;
    while (index < list.length && list[index].size <= rand) {
        index ++;
    }
    return list[index].element;
}