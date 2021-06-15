const fs = require("fs-extra");
const path = require("path");
const XLSX = require("xlsx");
const debounce = require("debounce");
const _ = require("lodash");

const localizeDir = "../../res/localize";
const localizeName = "localize.xls";
const localizeFile = path.join(localizeDir, localizeName);

const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const first = s => s.slice(0, 1);
const rest = s => s.slice(1);

const getLangs = sheet => {
    // get all keys ending with 1 (A1, B1, ...)
    // but not A11, A21
    const keys = Object.keys(sheet)
        .filter(key => key.length === 2) // just assume that AA1 never happens
        .filter(key => key.endsWith("1"))
        .filter(key => key !== "A1");
    // get all the lang keys
    // return keys.reduce((langs, key) => {
    //     langs[sheet[key].w] = key.slice(0, 1);
    //     return langs;
    // }, {});
    return keys.map(key => ({
        code: sheet[key].w,
        col: first(key),
    }));
};

const writeToFile = localize => {
    const p = [];
    for (const code in localize) {
        const file = path.join(localizeDir, code);
        console.log("Writing to " + file);
        p.push(fs.promises.writeFile(file, JSON.stringify(localize[code], null, 4), "utf8"));
    }
    return Promise.all(p);
};
const findLastNotOf = (strSource, text) => strSource.length - _.takeRightWhile(strSource, char => text.indexOf(char) >= 0).length;
const findFirstNotOf = (strSource, text) => _.takeWhile(strSource, char => text.indexOf(char) >= 0).length;

const doLocalize = debounce(async(event, filename) => {
    const workbook = XLSX.readFile(localizeFile);
    const sheet = workbook.Sheets["excel2text"];
    delete sheet["!ref"];
    const langs = getLangs(sheet);
    console.log(langs);
    const result = langs.reduce((map, { code, col }) => {
        console.log({ code, col });
        map[code] = {};
        return map;
    }, {});
    console.log("result", result);

    // we fucking loop through every thing from row 2
    // map B169 => vi(A169, B169)

    Object.entries(sheet)
        .filter(([key]) => first(key) !== "A")
        .forEach(([cell, value]) => {
            // cell = B169
            // value = { w: value }
            try {
                const curCol = first(cell);
                const curRow = rest(cell);
                const key = sheet["A" + curRow];
                const { code } = langs.find(({ code, col }) => col === curCol);
                let keyStr = key.w;
                let subStr = value.w;
                keyStr = keyStr.slice(findFirstNotOf(keyStr, " \t"));
                keyStr = keyStr.slice(0, findLastNotOf(keyStr, " \t") + 1);
                // from Localization.js, dont know wtf is this
                keyStr = keyStr.slice(findFirstNotOf(keyStr, "\""));
                keyStr = keyStr.slice(0, findLastNotOf(keyStr, "\"") + 1);
                subStr = subStr.slice(findFirstNotOf(subStr, "\""));
                subStr = subStr.slice(0, findLastNotOf(subStr, ";") + 1);
                subStr = subStr.slice(0, findLastNotOf(subStr, "\"") + 1);
                subStr = subStr.replace(/\\n/g, "\n");
                result[code][keyStr] = subStr;
            } catch (e) {
                console.log("Ignore row", cell);
            }
        });

    await writeToFile(result);
    console.log("Done generate localize.");

    /* final:
        vi: JSON.stringify({
            key: valúa,
        }),
        en: JSON.stringify({
            key: value,
        }),
     */
}, 100);
(async function main() {
    await doLocalize("change", localizeName);
    fs.watch(localizeDir, "utf-8", (event, filename) => {
        console.log(event, filename);
        if (filename !== localizeName) return;
        doLocalize(event, filename);
    });
})();
