const { format } = require("./src/format");

/**
 * Input, output
 */
const inputPath = "input/";
const outputPath = "output/";
const fileName = "localize.xls";
const currentFormat = format.type.STRING;

module.exports = {
    inputPath,
    outputPath,
    fileName,
    currentFormat,
}