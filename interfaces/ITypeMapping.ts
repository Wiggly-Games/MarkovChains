/*
    TypeMapping allows us to map from any type into numerical values.
    This allows us to store all our data as numbers, and then parse them back into the origin values later.
*/

export interface ITypeMapping<T> {
    Set(values: T[]): void;
    Update(values: T[]): void;
    GetValue(data: T): number;
    Parse(value: number): T;
    GetAllValues(): T[];
}