const fs = require("fs/promises");
const getLocalizeObject = require("./src/get-localize-from-file");

/**
 * Input, output
 */
const inputPath = "testing/";
const outputPath = "test-localize/";
const fileName = "localize.xls";

const loopAllDir = async function (pathDir) {
    const files = await fs.readdir(pathDir, {
        encoding: "utf-8",
        withFileTypes: true
    });

    const fileList = files.filter(file => file.name === fileName).map(file => getLocalizeObject(pathDir + file.name));
    const folderList = files.filter(file => file.isDirectory()).map(file => loopAllDir(pathDir + file.name + "/"));

    const fileObject = {};
    const addToFileObject = (localizeObject) => {
        const keys = Object.keys(localizeObject);
        keys.forEach(key => {
            if (!fileObject[key]) fileObject[key] = "";
            fileObject[key] += localizeObject[key];
        })
    };

    await Promise.all([...fileList, ...folderList]).then(results => results.forEach((addToFileObject)));
    return fileObject;
};

const main = async () => {
    await fs.access(outputPath).catch(async reason => reason.code === "ENOENT" ? await fs.mkdir(outputPath) : "");
    const fileObject = await loopAllDir(inputPath, { isFirstTime: true });
    console.log("");
    for (let language in fileObject) {
        fs.writeFile(outputPath + language, fileObject[language], {
            encoding: "utf8",
            flag: "w+"
        }).then(() => console.log("DONE WRITING TO FILES " + outputPath + language));
    }
}
main();