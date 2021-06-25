
const fs = require("fs/promises");
const formatXmlTag = require("./format-xml-tag");

const format = {
    type: {
        STRING: "STRING",
        ELEMENT: "ELEMENT",
    },
    formatObjectFunction: {
        STRING: (key, value) => value ? formatXmlTag.formatToString(value) : key,
        ELEMENT: (key, value) => value ? formatXmlTag.formatToElement(value) : { content: key, style: {} }
    },
    fileExtension: {
        STRING: "",
        ELEMENT: ".json"
    },
    formatWriteFunction: {
        ELEMENT: (languageObject) => JSON.stringify(languageObject),
        STRING: (languageObject) => {
            let finalString = "";
            for (let key in languageObject) {
                const value = languageObject[key];
                finalString += key + " = \"" + value + "\"" + "\n";
            }
            return finalString;
        }
    }
};

const formatLanguagesObject = (languagesObject, formatType) => {
    for (let languageKey in languagesObject) {
        const languageObject = languagesObject[languageKey];
        for (let key in languageObject)
            languageObject[key] = format.formatObjectFunction[formatType](key, languageObject[key] ? languageObject[key].r : null);
    }
    return languagesObject;
};

const writeWithFormat = (outputPath, languagesObject, formatType) => {
    const writePromises = [];
    for (let language in languagesObject) {
        const path = outputPath + language + format.fileExtension[formatType];
        writePromises.push(fs.writeFile(path, format.formatWriteFunction[formatType](languagesObject[language]), {
            encoding: "utf8",
            flag: "w+"
        }).then(() => console.log("DONE WRITING TO FILES " + path)));
    }
    return Promise.all(writePromises);
};

module.exports = { format, formatLanguagesObject, writeWithFormat };