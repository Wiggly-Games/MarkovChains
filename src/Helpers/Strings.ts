/*
    Implements helper methods for Strings:
        - Separating a list of strings into sentences, 
        - Separating a sentence into a list of words
*/

import { ClearBlanks } from "./Arrays";

// Splits a single long string into separate sentences.
export function SplitSentences(trainingSet: string): string[] {
    return ClearBlanks(trainingSet.split(/[\n\.\?\!]/).map(x => x.trim()));
}

// Splits a single sentence into separate words.
export function SplitWords(sequence: string): string[] {
    return ClearBlanks(sequence.split(" "));
}