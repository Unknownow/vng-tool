const xlsx = require("xlsx");
const fs = require("fs/promises");

const keyDef = "key";

const getSheet = async (inputFilePath) => {
    const localizeFile = await xlsx.readFile(inputFilePath);
    const originalSheet = localizeFile.Sheets[localizeFile.SheetNames];
    return originalSheet;
};
const getCellIndex = function (cellID = "") {
    const rowArray = cellID.match(/[0-9]+/);
    const columnArray = cellID.match(/[a-zA-Z]+/);
    return {
        row: +rowArray[rowArray.length - 1],
        column: columnArray[0],
    }
};
/**
 * 
 * @param {string} inputFilePath 
 * @returns 
 */
const getLanguagesObjectInFile = async (inputFilePath) => {
    const originalSheet = await getSheet(inputFilePath);
    // FIND KEY ROW AND INIT JSON OBJECTS
    let keyCellProp = {};
    const languagesObject = {};
    const keyColumnList = [];

    for (let cellID in originalSheet) {
        if (originalSheet[cellID].t === "s") {
            const { row, column } = getCellIndex(cellID);
            if (originalSheet[cellID].v.toLowerCase() === keyDef) keyCellProp = { row, column };
            else if (row === keyCellProp.row) {
                languagesObject[column] = { language: originalSheet[cellID].v };
                if (column !== keyCellProp.column) keyColumnList.push(column);
            }
        }
        else delete originalSheet[cellID];
    }

    // CREATE JSON OBJECT
    for (let cellID in originalSheet) {
        const { row, column } = getCellIndex(cellID);
        if (column !== keyCellProp.column || row === keyCellProp.row) continue;
        const keyString = originalSheet[cellID].v;
        keyColumnList.forEach(column => {
            const cellID = column + row;
            const value = originalSheet[cellID] ? originalSheet[cellID] : null;
            languagesObject[column][keyString] = value;
        });
    }

    // DELETE COLUMN KEY
    for (let column in languagesObject) {
        const language = languagesObject[column].language;
        const columnValue = languagesObject[column];
        delete languagesObject[column];
        if (language === keyDef) continue;
        languagesObject[language] = columnValue;
        delete languagesObject[language].language;
    }
    return languagesObject;
};
const getLanguagesObject = async function (pathDir, fileName) {
    const files = await fs.readdir(pathDir, {
        encoding: "utf-8",
        withFileTypes: true
    });
    const fileList = files.filter(file => file.name === fileName).map(file => getLanguagesObjectInFile(pathDir + file.name));
    const folderList = files.filter(file => file.isDirectory()).map(file => getLanguagesObject(pathDir + file.name + "/", fileName));

    const fileObject = {};
    const addToFileObject = (localizeObject) => {
        const languages = Object.keys(localizeObject);
        languages.forEach(language => {
            if (!fileObject[language]) fileObject[language] = {};
            Object.keys(localizeObject[language]).forEach(key => fileObject[language][key] = localizeObject[language][key]);
        })
    };
    await Promise.all([...fileList, ...folderList]).then(results => results.forEach(addToFileObject));
    return fileObject;
};

module.exports = { getLanguagesObject };
