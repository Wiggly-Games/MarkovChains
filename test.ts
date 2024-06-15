import { Bag } from "@wiggly-games/data-structures";
import { MarkovChain } from "./main";
import * as TestData from "./TestData/WeirdAl.json"
import { CreateDirectory } from "@wiggly-games/files";

(async () => {
    const path = require.main.path + "\\Static\\WeirdAl";
    CreateDirectory(require.main.path + "\\Static");

    const chain = new MarkovChain(path, {
        WordCount: 50,
        Backoff: true,
        MinBackoffLength: 2,
        TrainingLength: 5,
        MinRequiredOptions: 3,
        StopAtFewerOptions: false
    });

    await chain.Train([
        [1, 2, 3, 4, 5],
        [1, 2, 4, 3, 5],
        [1, 2, 5, 4, 3]
    ]);
    console.log(chain);

    const result = await chain.Generate();
    console.log(result);

    //await chain.Train((TestData as string[]).join("\n"));
    //await chain.Save();
    
    /*await chain.Load();
    for (let i = 0; i < 100; i++) {
        console.log(await chain.Generate());
    }*/
})()