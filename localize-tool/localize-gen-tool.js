const path = "localize-tool/";
const fileName = "localize.xls";

const writeLocalize = require("./write-localize-to-file");

writeLocalize(path + fileName, path).then(() => { writeLocalize(path + fileName, path, { flag: "a" }) })