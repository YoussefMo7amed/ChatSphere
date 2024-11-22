const crypto = require("crypto");

/**
 * Generates a random token.
 * @returns {string} - The generated token.
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

module.exports = { generateToken };
