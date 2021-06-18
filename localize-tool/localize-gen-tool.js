const xlsx = require("xlsx");
const fs = require("fs");

const localizeFile = xlsx.readFile("localize-tool/test.xlsx");
const originalSheet = localizeFile.Sheets[localizeFile.SheetNames];

const keyDef = "key";
const getCellIndex = function (cellID = "") {
    const rowArray = cellID.match(/\d/g);
    const columnArray = cellID.match(/[a-zA-Z]*/g);
    return {
        row: +rowArray[rowArray.length - 1],
        column: columnArray[0],
    }
};

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
        const value = originalSheet[cellID] ? originalSheet[cellID] : { h: keyString };
        newFile[column][keyString] = value;
    });
}

for (let column in newFile) {
    const language = newFile[column].language;
    const columnValue = newFile[column];
    delete newFile[column];
    if (language === keyDef) continue;
    newFile[language] = columnValue;
    delete newFile[language].language;
    fs.writeFileSync("localize-tool/" + language + ".json", JSON.stringify(newFile[language]), "utf8");
}

let outputFile = fs.openSync("localize-tool/test.json", "w+");
fs.writeFileSync(outputFile, JSON.stringify(newFile), "utf8");
fs.closeSync(outputFile);

/*
    <span style=\"font-size:13pt;\">Vui</span>
    <span style=\"font-size:13pt;\"></span>
    <span style=\"font-size:18pt;\">Cùng</span>
    <span style=\"font-size:13pt;\"></span>
    <span style=\"font-size:13pt;\">
        <b>Euro</b>
    </span>
    <span style=\"font-size:13pt;\"></span>
    <span style=\"font-size:13pt;\">
        <i>2020</i>
    </span>
*/
const regexComponent = RegExp(/<(.*)\b[^>]*.*?<\/\1>/g);
const regexTag = RegExp(/(?<=<)[^<>/]+?(?=>)/g);
const regexValue = RegExp(/(?<=>)[^<>/]+?(?=<)/g);

/**
 * 
 * @param {string} value 
 */
const formatValue = (value) => {
    const subValue = value.match(regexComponent);
    subValue.forEach(value => {
        console.log(JSON.stringify(value))
        console.log(JSON.stringify(value.match(regexTag)[0]))
        console.log("\n")
    });
    let finalString = "";
}

formatValue("<span style=\"font-size:13pt;\">Vui</span><span style=\"font-size:13pt;\"> </span><span style=\"font-size:18pt;\">Cùng</span><span style=\"font-size:13pt;\"> </span><span style=\"font-size:13pt;\"><b>Euro</b></span><span style=\"font-size:13pt;\"> </span><span style=\"font-size:13pt;\"><i>2020</i></span>");