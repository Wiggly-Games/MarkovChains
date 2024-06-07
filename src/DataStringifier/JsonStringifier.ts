import { IStringify } from "../../interfaces";

// Internal. Defines a class with the stringification + parsing methods.
type Classifier<S, Q> = {
    Class: S;
    Stringify: (data: S) => any;
    Load: (data: Q) => S;
}

export class JsonStringifier<T> implements IStringify<T> {
    _classDefinitions: Classifier<any, any>[];

    constructor() {
        this._classDefinitions = [];
    }

    // Adds a class that we can stringify / parse.
    AddClassDefinition<S extends Function, R, Q>(ClassType: S, Stringify: (data: R) => any, Load: (buffer: Q) => R) {
        this._classDefinitions.push({
            Class: ClassType,
            Stringify: (data: R) => {
                return {
                    Key: ClassType.name,
                    Value: Stringify(data),
                }
            },
            Load: Load
        });
    }

    // Stringifies the data
    Stringify(data: T): string {
        return JSON.stringify(data, (_, value) => {
            const matches = this._classDefinitions.filter(def => value instanceof def.Class);
            if (matches.length > 1) {
                throw `Found > 1 match for class: ${value}; we can't do that sir`
            }

            return matches.length > 0 ? matches[0].Stringify(value) : value;
        });
    }

    // Parses the data back into an object
    Parse(data: string): T {
        return JSON.parse(data, (_, value) => {
            const matches = this._classDefinitions.filter(def => value.Key == def.Class.name);
            if (matches.length > 1) {
                throw `Found > 1 match for class: ${value.Key}; we can't do that sir`
            }

            return matches.length > 0 ? matches[0].Load(value.Value) : value;
        })        
    }    
}