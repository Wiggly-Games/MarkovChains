/*
    Currently designed to test Training.
*/

import { DataList, Generate, Train } from "./src";
import * as TrainingSet from "./TestData/WeirdAl.json";

(async () => {
    const list = new DataList();
    await Train(list, TrainingSet.join("\n"));

    for (let i = 0; i < 100; i++) {
        const response = await Generate(list);
        console.log(response + "\n\n");
    }
})();