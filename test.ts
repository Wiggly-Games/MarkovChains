import { MarkovChain } from "./main";
import * as TestData from "./TestData/WeirdAl.json"

(async () => {
    const chain = new MarkovChain(require.main.path + "\\Static");
    //await chain.Train(TestData.join("\n"))
    
    for (let i = 0; i < 100; i++) {
        console.log(await chain.Generate());
    }
})()