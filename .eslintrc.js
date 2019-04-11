module.exports = {
  "extends": ["eslint:recommended", "google"],
  // "extends": "google",
  "env": {"node": true, "es6": true},
  "plugins": [
    "jsdoc",
  ],
  "rules": {
    "no-console": "off",
    "no-constant-condition": [
      "error",
      {
        "checkLoops": false,
      },
    ],
    "no-multi-spaces": [
      "error",
      {
        "ignoreEOLComments": true,
      },
    ],
    "indent": [
      "error",
      2,
      {
        "CallExpression": {"arguments": 2},
        "FunctionDeclaration": {"body": 1, "parameters": 2},
        "FunctionExpression": {"body": 1, "parameters": 2},
        "MemberExpression": 2,
        "ObjectExpression": 1,
        "SwitchCase": 1,
        "ignoredNodes": ["ConditionalExpression"]
      },
    ],
    "valid-jsdoc": [
      "error",
      {
        "prefer": {
          "return": "returns",
        },
      },
    ],
    "jsdoc/check-alignment": 1,
    "jsdoc/check-examples": 1,
    "jsdoc/check-indentation": 1,
    "jsdoc/check-param-names": 1,
    "jsdoc/check-syntax": 1,
    "jsdoc/check-tag-names": 1,
    "jsdoc/check-types": 1,
    "jsdoc/newline-after-description": 1,
    "jsdoc/no-undefined-types": 1,
    "jsdoc/require-description": 1,
    "jsdoc/require-description-complete-sentence": 1,
    "jsdoc/require-example": 0,
    "jsdoc/require-param": 1,
    "jsdoc/require-param-description": 1,
    "jsdoc/require-param-name": 1,
    "jsdoc/require-param-type": 1,
    "jsdoc/require-returns": 1,
    "jsdoc/require-returns-check": 1,
    "jsdoc/require-returns-description": 1,
    "jsdoc/require-returns-type": 1,
    "jsdoc/valid-types": 1,
  },
};
