/*
    Implements helper methods for Strings:
        - Separating a list of strings into sentences, 
        - Separating a sentence into a list of words

    Note: For sentence splitting, regex copied from https://stackoverflow.com/questions/18914629/split-string-into-sentences-in-javascript
*/

import { ClearBlanks } from "./Arrays";

// Splits a single long string into separate sentences.
export function SplitSentences(trainingSet: string): string[] {
    return ClearBlanks(trainingSet.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split(/[\|\n]/).map(x => x.trim()));
}

// Splits a single sentence into separate words.
export function SplitWords(sequence: string): string[] {
    return ClearBlanks(sequence.split(" "));
}

// Joins a bunch of words together to form a sentence.
export function JoinWords(sequence: string[]): string {
    return sequence.join(" ");
}