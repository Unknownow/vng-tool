const formatTag = {};
/**
 * 
 * @param {string} value 
 * @returns {string} formatted value
 */
formatTag.formatColorValue = (value) => {
    if (value.match(/[0-9A-Z]+/) && value.length === 8) return "#" + value.slice(2);
    return "#FFFFFF"
}

module.exports = formatTag