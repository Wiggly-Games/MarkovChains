// I am a fish
// I am a dog
// A dog goes bark
// A fish can swim
// Generating, sequence of 4.
// I, A - starting words.
// Picks one at random, it ends up with "I".
// Sequence: I
// Generating from "I"

/*
    Starting Chain:
    {

    }

    Train: "I am a fish"

    Starting Words:
    {
        "I"
    }

    Chain:
    {
        "I" -> ["am"]
        "I am" -> ["a"],
        "am" -> ["a"],
        "I am a" -> ["fish"],
        "am a" -> ["fish"],
        "a" -> ["fish"]
    }
*/

// If I were to generate rnadomly here:
// Starting Sequence: "I"
// Next word: "I" -> ["am"], has to pick "am".
// Next word: "I am" -> ["a"], picks "a".
// Next word: "I am a" -> ["fish"], picks "fish".

// Now we train on "I am a dog"
/*
    Starting Words:
    {
        "I"
    }

    Chain:
    {
        "I" -> ["am"]
        "I am" -> ["a"]
        "I am a" -> ["fish"]
    }

    "I" is already a starting word.
    "I" -> "am" already exists.
    "I am" -> "a" already exists.
    "I am a" -> ["fish", "dog"].

    New chain:
    Chain:
    {
        "I" -> ["am"]
        "I am" -> ["a"]
        "I am a" -> ["fish", "dog"]
    }

*/

// The part we're ignoring so far is probabilities. "I" now has 2x the odds of being selected.

// If we now train on "A dog goes bark":
/*
    Starting words becomes "I", "A" - since we can now start a sentence at "A".

    Starting Words:
    {
        "I" -> 2,
        "A" -> 1
    }

    The problem here is that I should have double odds of "A".

    "A dog goes bark":
    Chain:
    {
        "I" -> ["am"]
        "I am" -> ["a"]
        "I am a" -> ["fish", "dog"],
        "A" -> ["dog"],
        "A dog" -> ["goes"],
        "A dog goes" -> ["bark"]
    }

    New chain:
    {
        "I" -> ["am"]
        "I am" -> ["a"]
        "I am a" -> ["fish", "dog"],
        "A" -> ["dog"],
        "A dog" -> ["goes"],
        "A dog goes" -> ["bark"]
    }


*/

// If I generate now, including backtracking (which means we can chop down how many words are in the sequence so far):
// Say we start with "I"
// "I" -> ["am"], sequence is "I am"
// "I am" -> ["a"], sequence is "a"
// "I am a" -> ["fish", "dog"], selected at random. Selects "dog".
// "I am a dog" -> nothing.
// With backtracking:
// am a dog -> nothing.
// a dog -> ["goes"].
// a dog goes -> ["bark"].
// This gives us a new sentence: I am a dog goes bark.

// Question here: Probability. "I" is double chance of "A".
// Every starting word is mapped to a number, the number of times it was seen.
// When generating, create a list, where every element has:
//   size -> number
//   key: starting word.
// When we go to generate, we:
//  1. Start a counter at 0, and list as [ ]
//  2. Loop through every starting word
//  3. Increment our counter by this word's value, and add to the set:
//      {
//        size: counter,
//        key: this word
//      }
//  4. We pick a random number, 0 through counter-1, loop through the set, and take the first word where size > number.
//  Using the example above:
/*
    Starting Words were:
    {
        "I" -> 2,
        "A" -> 1
    }

    List is: [ ]
    Counter is: 0

    Element 0 "I":
        Counter += 2
        List becomes: [{ size: 2, key: "I" }]
    Element 1 "A":
        Counter += 1
        List becomes: [{ size: 2, key: "I" }, { size: 3, key: "A"} ]

    Counter is 3.
    Random number 0 - 2.

    If 0: Take size=2, "I"
    If 1: Take size=2, "I"
    If 2: Take size=3, "A"
*/

// Question 2: "A dog goes", what about "dog goes"?
// For this: Backtrack the sequence as we train, where we chop down the number of words as we go back (so 4 words -> last 3 -> last 2 -> last 1 ...)