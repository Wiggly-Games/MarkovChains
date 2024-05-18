# Overview
This is a random text generator built off of Markov Chains.

# Installing
Run the command `npm install ....`

# Training
To train the data, pass in a string which is a list of sentences. The sentences can be broken up by:
- New lines
- Periods
- Question marks
- Exclamation marks

# Generating
Once Trained, you can call the `Generate()` method to generate a random string of text.

# Example
```ts
import MarkovChain from "..."

const chain = new MarkovChain()
await chain.Train("Text1. Text2. Text3. Text4. Text5.")
const response = chain.Generate();
console.log(response);

```