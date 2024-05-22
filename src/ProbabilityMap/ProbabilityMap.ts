type InputTypes<T> = ([any, number])[] | Map<T, number> | undefined;

export class ProbabilityMap<T> {
    private _data: Map<T, number>;
    private _count: number;

    // Creates a new ProbabilityMap.
    constructor(data?: InputTypes<T>){
        this._data = ProbabilityMap.ConvertToMap<T>(data);

        let counter = 0;
        if (data) {
            for (const [key, numberSeen] of this._data.entries()){
                counter += numberSeen;
            }
        }

        this._count = counter;
    }
    static ConvertToMap<T>(inputData: InputTypes<T>) {
        // 1. If no input data is provided, we just use an empty map.
        if (inputData === undefined) {
            return new Map<T, number>();
        }

        // 2. If we have a map, we can just use the map directly.
        if (inputData instanceof Map) {
            return inputData;
        }

        // 3. Otherwise, we need to convert it to a map. This is an array of elements.
        return new Map(inputData);
    }
    
    // Adds a key to the map, either increasing its probability or setting it as an option.
    Add(key: T){
        if (this._data.has(key)) {
            // If the key is already in the map, increase its probability.
            this._data.set(key, this._data.get(key) + 1);
        } else {
            // Otherwise, set it as a new option with a starting probability = 1.
            this._data.set(key, 1);
        }

        this._count += 1;
    }
    GetKeys(): IterableIterator<T> {
        return this._data.keys();
    }
    GetCount(): number {
        return this._count;
    }
    GetRandom(): T {
        // 1. We need to create a list of all the keys that we've seen with their probabilities of occurring.
        let counter = 0;
        let list = [ ];
        for (const [key, numberSeen] of this._data.entries()){
            counter += numberSeen;
            list.push({
                size: counter,
                key: key
            });
        }
    
        // 2. Pick a random number from 0 - Counter-1
        let rand = Math.floor(Math.random() * counter)
    
        // Walk through the list until we find the first key where size > our random number.
        let index = 0;
        while (index < list.length && list[index].size <= rand) {
            index ++;
        }
    
        // Return the element at this index.
        return index >= list.length ? undefined : list[index].key;
    }
    GetMap(): ReadonlyMap<T, number> {
        return this._data;
    }
    Clear() {
        this._data.clear();
    }
    IsProbabilityMap(){
        return true;
    }
}