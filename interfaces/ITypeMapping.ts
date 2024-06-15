/*
    TypeMapping allows us to map from any type into numerical values.
    This allows us to store all our data as numbers, and then parse them back into the origin values later.
*/

import { TInternal } from "../src";

export interface ITypeMapping<T> {
    Set(values: T[]): void;
    Update(values: T[]): void;
    GetValue(data: T): TInternal;
    Parse(value: TInternal): T;
    GetAllValues(): T[];
}