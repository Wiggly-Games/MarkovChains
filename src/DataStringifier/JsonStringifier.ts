import { IStringify } from "../../interfaces";
import { ClassDefinitions } from "./Classify";


export class JsonStringifier<T> implements IStringify<T> {
    _classTranslators: ClassDefinitions;
    
    constructor() {
        this._classTranslators = new ClassDefinitions();
    }

    // Adds a class that we can stringify / parse.
    AddClassDefinition<S extends Function, R, Q>(ClassType: S, Stringify: (data: R) => any, Load: (buffer: Q) => R) {
        this._classTranslators.AddDefinition(ClassType, Stringify, Load);
    }

    // Stringifies the data
    Stringify(data: T): string {
        return JSON.stringify(data, (_, value) => this._classTranslators.Get(value));
    }

    // Parses the data back into an object
    Parse(data: string): T {
        return JSON.parse(data, (_, value) => this._classTranslators.Parse(value));
    }
}