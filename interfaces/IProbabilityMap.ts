/*
    Interface for a Probability Map, which allows storing and retrieving elements with a given probability.
*/

export function IsProbabilityMap(t: unknown) {
    return t instanceof Object && "IsProbabilityMap" in (t as any);
}

export interface IProbabilityMap<T> {
    Add(key: T): void;
    GetKeys(): IterableIterator<T>;
    GetCount(): number;
    GetRandom(): T;
    GetMap(): ReadonlyMap<T, number>;
    Clear(): void;
    IsProbabilityMap(): boolean;
}