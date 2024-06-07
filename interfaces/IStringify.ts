/*
    Interface for stringifying objects, and parsing the object out of strings.
    This is necessary for things like saving data to file, where it has to be stringified first.
*/

export interface IStringify<T> {
    Stringify(data: T): string;
    Parse(data: string): T;

    AddClassDefinition<S extends Function, R, Q>(ClassType: S, Stringify: (data: R) => any, Load: (buffer: Q) => R);
}