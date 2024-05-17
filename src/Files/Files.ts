import * as fs from "fs";
import * as path from "path";

const fsPromises = fs.promises;

export async function CreateDirectory(path: string){
    try {
        await fsPromises.mkdir(path);
    } catch (exception) {
        // If it already exists, do nothing
        if (exception.code == 'EEXIST') {

        } else {
            // not an eexist exception, re-throw the error
            throw exception;
        }
    }
}

export async function Append(filePath : string, text : string) {
    await fsPromises.appendFile(filePath, `${text}\n`);
}

