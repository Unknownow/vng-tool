const fs = require("fs");
const inputPath = "testing/";
const outputPath = "localize/";
const outputFileName = "localize.json";
const fileName = "localize.xls";

const getLocalizeObject = require("./src/get-localize-from-file");

const loopAllDir = async function (pathDir) {
    const files = await fs.readdirSync(pathDir, {
        encoding: "utf-8",
        withFileTypes: true
    });

    const fileObject = {};

    const addToFileObject = (localizeObject) => {
        const keys = Object.keys(localizeObject);
        keys.forEach(key => {
            if (!fileObject[key]) fileObject[key] = localizeObject[key];
            for (let keyString in localizeObject) fileObject[keyString] = localizeObject[keyString];
        })
    };
    for (const file of files) {
        if (file.name === fileName)
            addToFileObject(await getLocalizeObject(pathDir + fileName))
        if (file.isDirectory())
            addToFileObject(await loopAllDir(pathDir + file.name + "/"))
    }
    return fileObject;
};

const main = async () => {
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);
    const fileObject = await loopAllDir(inputPath, { isFirstTime: true });
    await fs.writeFileSync(outputPath + outputFileName, JSON.stringify(fileObject), {
        encoding: "utf8",
        flag: "w+"
    });
    console.log("\nDONE WRITING TO FILES " + outputPath + outputFileName);
    console.log("\nLOCALIZE CAN BE FOUND IN: " + outputPath);
}
main();