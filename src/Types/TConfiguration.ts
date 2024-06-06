/*
    The Configuration for a Markov Chain.

    Word Count: The highest number of words that we're generating. The result will be up to this long in length.
    MinRequiredOptions: The number of options that we're choosing from, backing off if fewer choices are found.
    TrainingLength: The maximum length of a single chain while training - it will take this many words back to choose our next word.
    Backoff: Whether or not we want to perform the backing off process if we haven't found enough options from our current set.
    MinBackoffLength: How few words we're willing to perform the back off to. Eg. If this is two, we'll only go back to two words at minimum.
    StopAtFewerOptions: Flag to set whether or not we want to stop generating if we have fewer than the required number of options.
*/


export type TConfiguration = {
    WordCount: number,
    MinRequiredOptions: number,
    TrainingLength: number,
    Backoff: boolean,
    MinBackoffLength: number,
    StopAtFewerOptions: boolean
};