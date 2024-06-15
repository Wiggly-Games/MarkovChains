/*
    Implements helper methods for Arrays:
        - Removes all empty strings from a list of strings
        - Retrieves the ending sequence from a chain, given the length of words to include.
*/

const splitter = String.fromCharCode(1);

export const ClearBlanks = (x: string[]) => x.filter(x => x !== "");
export const GetEndSequence = (sequence: any[], chainLength: number) => sequence.slice(-chainLength);
export const CreateKeyFromSequence = (sequence: any[]) => sequence.join(splitter);
