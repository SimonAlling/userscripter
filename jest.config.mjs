export default {
  "testEnvironment": "jsdom",
  "transform": {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          resolveJsonModule: true,
        },
      },
    ],
  },
  "testRegex": ".+\\.test\\.ts$",
  "moduleFileExtensions": [
    "ts",
    "js",
  ],
};
