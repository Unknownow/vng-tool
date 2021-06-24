const config = require("./config")

/**
 * 
 * @param {string} value 
 * @returns {string} formatted value
 */
const formatColorValue = (value) => {
    if (value.match(/[0-9A-Z]+/) && value.length === 8) return "#" + value.slice(2);
    return config.defaultValue.color;
}

module.exports = {
    formatColorValue,
};