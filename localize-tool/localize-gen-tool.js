const fs = require("fs");
const path = "localize-tool/testing/";
const fileName = "localize.xls";

const getLocalizeObject = require("./get-localize-from-file");

const loopAllDir = async function (pathDir) {
    const files = await fs.readdirSync(pathDir, {
        encoding: "utf-8",
        withFileTypes: true
    });

    const fileObject = {};

    const addToFileObject = (localizeObject) => {
        const keys = Object.keys(localizeObject);// }
        keys.forEach(key => {
            if (!fileObject[key]) fileObject[key] = "";
            fileObject[key] += localizeObject[key];
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
    const fileObject = await loopAllDir(path, { isFirstTime: true });
    for (let language in fileObject) {
        await fs.writeFileSync(path + language, fileObject[language], {
            encoding: "utf8",
            flag: "w+"
        });
    }
}
main();


