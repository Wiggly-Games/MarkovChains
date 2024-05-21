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