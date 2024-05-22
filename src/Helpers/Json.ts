// Note: Copied from StackOverflow, https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map

// Updates JSON stringify to stringify maps.
export function SaveWithMaps(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

// Loads JSON, includes reading in maps.
export function LoadWithMaps(key, value) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
}