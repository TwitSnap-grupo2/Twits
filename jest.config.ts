/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  globalTeardown: "./src/tests/teardown.ts",
};
