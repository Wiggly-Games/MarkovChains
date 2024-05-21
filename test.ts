import { MarkovChain } from "./main";
import * as TestData from "./TestData/WeirdAl.json"
import { PersistentData } from "./src";

(async () => {
    const path = `C:\\Users\\Wiggles\\OneDrive\\Documents\\Programming\\MarkovChains\\Database`;
    /*const chain = new MarkovChain(path);
    await chain.Train(TestData.join("\n"))
    
    for (let i = 0; i < 100; i++) {
        console.log(await chain.Generate());
    }*/

    const psd = new PersistentData(path);
    await psd.Connect();
    await psd.Add("Test1", "Test2");
    
    let result = await psd.Get("Test1");
    console.log(result);

    await psd.AddStartingKey("Test1");
    
    await psd.Disconnect();
})()