import { ITypeMapping } from "../../interfaces";

export class TypeMapping<T> implements ITypeMapping<T> {
    private _values: T[];
    private _map: Map<T, number>;
    
    constructor(){
        this._values = [];
        this._map = new Map<T, number>();
    }
    
    // Sets the values of the TypeMapping, overriding any existing data.
    Set(values: T[]) {
        this._values = [];
        this._map = new Map<T, number>();
        this.Update(values);
    }

    // Adds any new values into the list of values.
    Update(values: T[]) {
        let unique = new Set(values);
        let index = this._values.length;
        unique.forEach(value => {
            if (!this._map.has(value)) {
                this._map.set(value, index);
                this._values.push(value);

                index++;
            }
        });
    }
    
    // Retrieves the numerical value for a piece of data.
    GetValue(data: T): number {
        return this._map.get(data);
    }

    // Returns the data value given its numerical representation.
    Parse(value: number): T {
        return this._values[value];
    }

    // Returns all of the mapping values.
    GetAllValues(): T[] {
        return this._values;
    }
}