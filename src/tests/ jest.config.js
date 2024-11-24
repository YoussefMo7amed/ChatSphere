module.exports = {
    testEnvironment: "node", // Use Node environment for testing
    testMatch: ["**/tests/**/*.test.js"], // Ensure Jest picks up the test files in 'tests' folder
    verbose: true, // Display detailed test results
    modulePathIgnorePatterns: ["<rootDir>/node_modules/"], // Ignore node_modules folder
};
