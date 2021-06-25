const { format } = require("./src/format");

/**
 * Input, output
 */
const inputPath = "test-localize-xls/";
const outputPath = "text-localize-files/";
const fileName = "localize.xls";
const currentFormat = format.type.ELEMENT;

module.exports = {
    inputPath,
    outputPath,
    fileName,
    currentFormat,
}