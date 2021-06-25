const fs = require("fs/promises");
const { getLanguagesObject } = require("./src/get-languages-object");
const { formatLanguagesObject, writeWithFormat } = require("./src/format");
const { inputPath, outputPath, fileName, currentFormat } = require("./config-tool");

const main = async () => {
    console.log("RUNNING LOCALIZE TOOL!");
    console.log("INPUT_PATH = " + inputPath);
    console.log("OUTPUT_PATH = " + outputPath);
    console.log("FILENAME TO FIND = " + fileName);
    console.log("CURRENT_EXPORT_FORMAT = " + currentFormat);
    console.log("-----------------------------------------------");
    await fs.access(outputPath).catch(async reason => reason.code === "ENOENT" ? await fs.mkdir(outputPath) : "");
    const languagesObject = await getLanguagesObject(inputPath, fileName);
    const formattedLanguagesObject = formatLanguagesObject(languagesObject, currentFormat);
    writeWithFormat(outputPath, formattedLanguagesObject, currentFormat).then(() => console.log("DONE!"));
}
main();