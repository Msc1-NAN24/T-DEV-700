/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "prettier.config.js",
    ".eslintrc.js",
    "jest.config.js",
    "serverless.ts",
    "/.serverless/",
  ],
};
