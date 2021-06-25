const config = require("./tag-config")
const { richTextTag, xmlTag } = require("./tag-config")

/**
 * 
 * @param {string} tag 
 * @returns {{key:string, value:string}}
 */
const convertXmlTag = (tag) => {
    for (let key in xmlTag) {
        if (tag.match(RegExp(xmlTag[key] + " "))) {
            let tagValue = tag.match(/(?<=").*(?=")/).shift();
            switch (xmlTag[key]) {
                case xmlTag.color:
                    tagValue = convertColorValue(tagValue);
                    break;
            }
            return {
                key: richTextTag[key],
                value: tagValue
            }
        }
    }
    return {};
};

/**
 * 
 * @param {string} value 
 * @returns {string} formatted value
 */
const convertColorValue = (value) => {
    if (value.match(/[0-9A-Z]+/) && value.length === 8) return "#" + value.slice(2);
    return config.defaultValue.color;
};

module.exports = {
    convertXmlTag,
};