// Note: Copied from StackOverflow, https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map

import { IProbabilityMap, IsProbabilityMap } from "../../interfaces";

// Updates JSON stringify to stringify maps.
export function SaveWithMaps(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries())
        }
    } else if (IsProbabilityMap(value)) {
        return {
            dataType: 'ProbabilityMap',
            value: Array.from(value.GetMap().entries())
        }
    } else {
        return value;
    }
}

// Loads JSON, includes reading in maps & probability maps.
// Outer function requires the function to create a new probability map, then returns a function that can be passed into JSON.parse.
export function LoadWithProbabilityMap(getProbabilityMap: (data?: Map<any, number>)=>IProbabilityMap<any>) {
    return function (key, value) {
        if(typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            } else if (value.dataType === 'ProbabilityMap') {
                return getProbabilityMap(value.value);
            }
        }
        return value;
    }
}