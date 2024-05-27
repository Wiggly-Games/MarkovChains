// Note: Copied from StackOverflow, https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
import { IBag } from "@wiggly-games/data-structures";

function IsBag(t: unknown) {
    return t instanceof Object && "IsBag" in (t as any);
}

// Updates JSON stringify to stringify maps.
export function SaveWithObjects(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries())
        }
    } else if (IsBag(value)) {
        return {
            dataType: 'Bag',
            value: Array.from(value.ConvertToMap().entries())
        }
    } else {
        return value;
    }
}

// Loads JSON, includes reading in maps & probability maps.
// Outer function requires the function to create a new probability map, then returns a function that can be passed into JSON.parse.
export function LoadWithObjects(getBag: (data?: Map<any, number>)=>IBag<any>) {
    return function (_, value) {
        if(typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            } else if (value.dataType === 'Bag') {
                return getBag(value.value);
            }
        }
        return value;
    }
}