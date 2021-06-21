const xlsx = require("xlsx");
const fs = require("fs");
const addTags = require("./add-tag");
const { keyDef } = require("./config");

const getCellIndex = function (cellID = "") {
    const rowArray = cellID.match(/\d/g);
    const columnArray = cellID.match(/[a-zA-Z]*/g);
    return {
        row: +rowArray[rowArray.length - 1],
        column: columnArray[0],
    }
};

/**
 * 
 * @param {string} localizePath 
 * @param {string} outputPath 
 * @param {{flag:string}} option 
 */
const writeLocalize = async (inputFilePath, outputPath, option = { flag: "w+" }) => {
    // OPEN LOCALIZE FILE!
    const localizeFile = await xlsx.readFile(inputFilePath);
    const originalSheet = localizeFile.Sheets[localizeFile.SheetNames];
    // FIND KEY ROW AND CREATE FILE OBJECTS
    let keyCellProp = {};
    const newFile = {};
    const keyColumnList = [];
    for (let cellID in originalSheet) {
        if (originalSheet[cellID].t === "s") {
            const { row, column } = getCellIndex(cellID);
            if (originalSheet[cellID].v.toLowerCase() === keyDef) keyCellProp = { row, column };
            else if (row === keyCellProp.row) {
                newFile[column] = { language: originalSheet[cellID].v };
                if (column !== keyCellProp.column) keyColumnList.push(column);
            }
        }
        else delete originalSheet[cellID];
    }

    //CREATE FILE OBJECTS
    for (let cellID in originalSheet) {
        const { row, column } = getCellIndex(cellID);
        if (column !== keyCellProp.column || row === keyCellProp.row) continue;
        const keyString = originalSheet[cellID].v;
        keyColumnList.forEach(column => {
            const cellID = column + row;
            const value = originalSheet[cellID] ? addTags(originalSheet[cellID].r) : keyString;
            newFile[column][keyString] = value;
        });
    }

    // WRITE TO FILE
    for (let column in newFile) {
        const language = newFile[column].language;
        const columnValue = newFile[column];
        delete newFile[column];
        if (language === keyDef) continue;
        newFile[language] = columnValue;
        delete newFile[language].language;
        await fs.writeFileSync(outputPath + language + ".json", JSON.stringify(newFile[language]), {
            encoding: "utf8",
            flag: option.flag
        });
    }
    // fs.writeFileSync(path + "all.json", JSON.stringify(newFile), "utf8");
};
module.exports = writeLocalize;
