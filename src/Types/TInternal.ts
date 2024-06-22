// Represents the Internal Value data type, used for representing values in the chain.
// Converts to/from input/output using the TMapping class.
export type TInternal = number;

// Parse from a string into the TInternal data.
export const ParseT = (value: string) => parseInt(value);