import { Bag } from "@wiggly-games/data-structures";
import { MarkovChain } from "./main";
import * as TestData from "./TestData/Wiggles.json"
import { CreateDirectory } from "@wiggly-games/files";
import { ClearBlanks } from "./src/Helpers";
import * as Files from "@wiggly-games/files";
import * as os from "os";

let log: string;
const delayAmnt = 10;

const start = new Date().getTime();
const interval = setInterval(async () => {
    const mu = process.memoryUsage();
    // # bytes / KB / MB / GB
    const gbNow = mu.heapUsed / 1024 / 1024 / 1024;
    const gbRounded = Math.round(gbNow * 100) / 100;
   
    const elapsedTimeInSecs = (Date.now() - start) / 1000;
    const timeRounded = Math.round(elapsedTimeInSecs * 100) / 100;
   
    await Files.Append(log, timeRounded + "," + gbRounded + os.EOL); // fire-and-forget
}, 500);

function delay(ms: number) {
    return new Promise((fulfill) => {
        setTimeout(fulfill, ms);
    });
}

function writeLog(txt: string) {
    Files.Append(log, txt);
    console.log(txt);
}

async function train(chain: MarkovChain<string>){
    const input = TestData as string[];
    const trainingData: string[][] = [];

    input.forEach(line => {
        let sentences = ClearBlanks(line.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split(/[\|\n]/).map(x => x.trim()));
        sentences.forEach(sentence => {
            let words = ClearBlanks(sentence.split(" "));
            trainingData.push(words);
        });
    });

    writeLog(`Started training.`);
    await chain.Train(trainingData);
    writeLog(`Finished training.`);
    global.gc();
    await delay(delayAmnt);
    
    writeLog(`Started saving.`);
    await chain.Save((x) => x);
    writeLog(`Finished saving.`);
    global.gc();
    await delay(delayAmnt);
}

async function generate(chain: MarkovChain<string>, gc: boolean){
    const start = new Date().getTime();

    writeLog(`Starting loading.`);
    await chain.Load((x) => x);
    writeLog(`Finished loading. Loaded in ${new Date().getTime() - start} ms.`);

    await delay(delayAmnt);
    writeLog(`Started generating.`);

    let count = gc ? 10000 : 50;
    for (let i = 0; i < count; i++) {
        let res = await chain.Generate();
        if (gc){
            global.gc();
            await delay(1);
        } else {
            console.log(res.join(" "));
        }
    }
    writeLog(`Stopped generating.`);
}

async function main(mode: number){
    const path = require.main.path + "\\Static\\Wiggles";
    CreateDirectory(require.main.path + "\\Static");

    const chain = new MarkovChain<string>(path, {
        WordCount: 50,
        Backoff: true,
        MinBackoffLength: 2,
        TrainingLength: 5,
        MinRequiredOptions: 3,
        StopAtFewerOptions: false
    });

    if (mode === 0) {
        await generate(chain, false);
    } else if (mode === 1) {
        await train(chain);
    } else {
        await generate(chain, true);
    }

    clearInterval(interval);
}

const mode = process.argv.find(x => x.startsWith("mode="))?.substring(5);
const output = process.argv.find(x => x.startsWith("out="))?.substring(4);
log = output ?? "./log.txt";
console.log(`Writing logs to file: ${log}`);

if (!global.gc) {
    console.error(`Test script requires the --expose-gc command line argument.`);
    console.error(`Please run again with the argument provided.`);
} else {
    switch (mode) {
        case "generate":
        case "g":
        case "0":
            main(0);
            break;
        case "train":
        case "t":
        case "1":
            main(1);
            break;
        case "gc":
            main(2);
            break;
        default:
            console.warn(`Unknown mode: ${mode}; please enter 'train' or 'generate'`);
            clearInterval(interval);
            break;
    }
}