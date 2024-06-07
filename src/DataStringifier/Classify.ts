// Internal. Defines a class with the stringification + parsing methods.
type Classifier<S, Q> = {
    Class: S;
    Stringify: (data: S) => any;
    Load: (data: Q) => S;
}

type SavedValue<S> = {
    Key: string;
    Value: S;
}

export class ClassDefinitions {
    _classDefinitions: Classifier<any, any>[];

    constructor(){
        this._classDefinitions = [];
    }

    AddDefinition<S extends Function, R, Q>(ClassType: S, Stringify: (data: R) => any, Load: (buffer: Q) => R) {
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

    Get(value: any) {
        const matches = this._classDefinitions.filter(def => value instanceof def.Class);
        if (matches.length > 1) {
            throw `Found multiple class definitions for type: ${value}; this is a problem. Please fix.`
        }

        return matches.length > 0 ? matches[0].Stringify(value) : value;
    }

    Parse(value: SavedValue<any>) {
        const matches = this._classDefinitions.filter(def => value.Key == def.Class.name);
        if (matches.length > 1) {
            throw `Found > 1 match for class: ${value.Key}; we can't do that sir`
        }

        return matches.length > 0 ? matches[0].Load(value.Value) : value;
    }
}
