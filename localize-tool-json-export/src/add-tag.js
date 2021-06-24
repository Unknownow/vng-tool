
const { richTextTag, xmlTag, defaultValue } = require("./config")
const formatTag = require("./format-tag")

const regexSplitString = RegExp(/<(.*)\b[^>]*.*?<\/\1>/g);
const regexTagValue = RegExp(/(?<=<)[^<>/]+?(?=\/>)/g);
const regexValue = RegExp(/(?<=>)[^><]+?(?=<)/g);

const addTags = (text) => {
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
                for (let key in xmlTag) {
                    if (tag.match(RegExp(xmlTag[key] + " "))) {
                        let tagValue = tag.match(/(?<=").*(?=")/).shift();
                        switch (xmlTag[key]) {
                            case xmlTag.color:
                                tagValue = formatTag.formatColorValue(tagValue);
                                break;
                        }
                        valueTagList[richTextTag[key]] = tagValue;
                    }
                }
            });
        subStringObject.tag = valueTagList;
        subStringObjects.push(subStringObject);
    });


    const countTagObject = {};
    subStringObjects.forEach(obj => {
        Object.keys(obj.tag).forEach(key => {
            if (!countTagObject[key]) countTagObject[key] = {};
            if (!countTagObject[key][obj.tag[key]]) countTagObject[key][obj.tag[key]] = 1;
            else countTagObject[key][obj.tag[key]] += 1;
        })
    })
    // Object.keys(countTagObject).forEach(key => {
    //     const obj = countTagObject[key];
    //     const maxKey = Object.keys(obj).sort((a, b) => obj[a] - obj[b]).pop();
    //     countTagObject[key] = maxKey;
    // })

    subStringObjects.forEach(obj => {
        const tagObject = obj.tag;
        // DELETE DEFAULT VALUE
        Object.keys(richTextTag).forEach(key => {
            if (tagObject[key] === defaultValue[key]) delete tagObject[key];
        })
        // Object.keys(tagObject).forEach(key => {
        //     if (tagObject[key] === countTagObject[key]) delete tagObject[key];
        // })
        if (Object.keys(tagObject).length === 0) delete obj.tag;
    })

    let finalString = "";
    subStringObjects.forEach((obj, index) => {
        // if (index > 0) finalString += " "
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
}

module.exports = addTags;