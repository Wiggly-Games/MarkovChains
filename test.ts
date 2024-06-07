import { Bag } from "@wiggly-games/data-structures";
import { MarkovChain } from "./main";
import * as TestData from "./TestData/Wiggles.json"
import { JsonStringifier } from "./src/DataStringifier/JsonStringifier";
import { CreateDirectory } from "@wiggly-games/files";

(async () => {
    const path = require.main.path + "\\Static\\Wiggles";
    CreateDirectory(require.main.path + "\\Static");

    const chain = new MarkovChain(path, {
        WordCount: 50,
        Backoff: true,
        MinBackoffLength: 2,
        TrainingLength: 5,
        MinRequiredOptions: 3,
        StopAtFewerOptions: false
    });

    await chain.Train((TestData as string[]).join("\n"));
    await chain.Save();
    
    /*await chain.Load();
    for (let i = 0; i < 100; i++) {
        console.log(await chain.Generate());
    }*/
})()