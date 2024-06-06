# Overview
This is a random text generator built off of Markov Chains.

# Installing
Run the command `npm install @wiggly-games/markov-chains`

# Training
To train the data, pass in a string which is a list of sentences. The sentences can be broken up by:
- New lines
- Periods
- Question marks
- Exclamation marks

# Generating
Once Trained, you can call the `Generate()` method to generate a random string of text.

# Settings
To use the chain, you have to fill in some setting values. These values are:
- WordCount: The highest number of words that we're generating. The result will be up to this long in length.
- MinRequiredOptions: The number of options that we're choosing from, backing off if fewer choices are found.
- TrainingLength: The maximum length of a single chain while training - it will take this many words back to choose our next word.
- Backoff: Whether or not we want to perform the backing off process if we haven't found enough options from our current set.
- MinBackoffLength: How few words we're willing to perform the back off to. Eg. If this is two, we'll only go back to two words at minimum.
- StopAtFewerOptions: Flag to set whether or not we want to stop generating if we have fewer than the required number of options.

# Example
```ts
import MarkovChain from "@wiggly-games/markov-chains"

const chain = new MarkovChain("C:\\Path\\To\\Some\\Folder", {
    ...Settings values
});
await chain.Train("Text1. Text2. Text3. Text4. Text5.");
const response = chain.Generate();
console.log(response);

```

Alternatively, please take a look at the [test.js](/test.ts) for an example of a working Markov Chains test script.