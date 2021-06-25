
const { richTextTag, defaultValue } = require("./tag-config")
const formatTag = require("./convert-xml-tag")

const regexSplitString = RegExp(/<(.*)\b[^>]*.*?<\/\1>/g);
const regexTagValue = RegExp(/(?<=<)[^<>/]+?(?=\/>)/g);
const regexValue = RegExp(/(?<=>)[^><]+?(?=<)/g);

/**
 * 
 * @param {string} text 
 * @returns {[{value:string,tag:{color:string}}]}
 */
const separateToObjects = (text) => {
    text = text.replace(/\r\n/g, "__n");
    const subStrings = text.match(regexSplitString);
    const subStringValues = text.match(regexValue);

    const subStringObjects = [];
    subStrings.forEach((subStringContent, index) => {
        const tagList = subStringContent.match(regexTagValue);
        const value = subStringValues[index];
        const subStringObject = { value, tag: {} };
        let valueTagList = {};

        if (tagList)
            tagList.forEach(tag => {
                const { key, value } = formatTag.convertXmlTag(tag);
                if (key && value) valueTagList[key] = value;
            });

        subStringObject.tag = valueTagList;
        subStringObjects.push(subStringObject);
    });

    subStringObjects.forEach(obj => {
        const tagObject = obj.tag;
        // DELETE DEFAULT VALUE
        Object.keys(richTextTag).forEach(key => tagObject[key] === defaultValue[key] && delete tagObject[key])
        if (Object.keys(tagObject).length === 0) delete obj.tag;
    })
    return subStringObjects;
};

const formatToString = (text) => {
    const objects = separateToObjects(text);

    let finalString = "";
    objects.forEach((obj, index) => {
        const { value, tag } = obj;
        if (!tag) return finalString += value;
        let preString = "";
        let postString = "";
        Object.keys(tag).forEach(key => {
            preString += "<" + key + " = " + tag[key] + ">";
            postString = "</" + key + ">" + postString;
        })
        finalString += preString + value + postString;
    })
    return finalString.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/__n/g, "\\n");
};

const formatToElement = (text) => {
    const objects = separateToObjects(text);
    const newObjects = [];
    objects.forEach(obj =>
        newObjects.push({
            content: obj.value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/__n/g, "\\n"),
            style: obj.tag ? obj.tag : {},
        })
    )
    return newObjects;
};

module.exports = {
    formatToString,
    formatToElement,
};