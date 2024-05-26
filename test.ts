import { MarkovChain } from "./main";
import * as TestData from "./TestData/WeirdAl.json"

(async () => {
    const path = require.main.path + "\\Static";

    const chain = new MarkovChain();
    //await chain.Train(TestData.join("\n"), path + "2")
    
    for (let i = 0; i < 100; i++) {
        console.log(await chain.Generate(path));
    }
})()