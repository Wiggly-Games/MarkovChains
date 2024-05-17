import * as File from "../Files/Files"
import * as Configuration from '../Configuration.json'

const LogsDirectory : string = `${process.cwd()}\\${Configuration.LogFiles.Directory}`;
File.CreateDirectory(LogsDirectory);

// Converts from the passed in data into an output string format.
// Output format includes current date, current time, and the message.
function createOutputMessage(...data) : string {
    // Output will be of the format:
    // DATE : TIME : Message
    var date = new Date();
    var yearMonthDay = date.toISOString().split('T')[0];
    var time = [date.getHours(), date.getMinutes(), date.getSeconds()].join(":");
    var message = [...data].join(" ");
    return `${yearMonthDay} - ${time} - ${message}`;
}

// Main method for writing to a log file. Takes the local file path (from root of the project) and data to output.
async function writeToLogs(logFile : string, ...data){
    var fullPath = `${LogsDirectory}\\${logFile}`;
    var text = createOutputMessage(...data);
    await File.Append(fullPath, text);
}

// Note: Create functions that can be exported here for writing to specific log files.
// These will use the writeToLogs() file with a specific path.