module.exports = {
  'extends': [
    'eslint:recommended',
    'google',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'env': {
    'node': true,
    'es6': true,
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {'modules': true},
    'project': 'tsconfig.json',
    'tsconfigRootDir': __dirname,
    'ecmaVersion': 2018,
  },
  'plugins': [
    'jsdoc',
    '@typescript-eslint',
  ],
  'globals': {
    'BigInt': true,
  },
  'rules': {
    'no-console': 'off',
    'no-constant-condition': [
      'error',
      {
        'checkLoops': false,
      },
    ],
    'no-multi-spaces': [
      'error',
      {
        'ignoreEOLComments': true,
      },
    ],
    'indent': [
      'error',
      2,
      {
        'CallExpression': {'arguments': 2},
        'FunctionDeclaration': {'body': 1, 'parameters': 2},
        'FunctionExpression': {'body': 1, 'parameters': 2},
        'MemberExpression': 2,
        'ObjectExpression': 1,
        'SwitchCase': 1,
        'ignoredNodes': ['ConditionalExpression'],
      },
    ],
    'valid-jsdoc': [
      'warn',
      {
        'prefer': {
          'return': 'returns',
        },
        'requireReturn': false,
        'requireReturnType': true,
        'requireParamDescription': true,
        'requireReturnDescription': true,
        'requireParamType': true,
      },
    ],
    'jsdoc/check-alignment': 1,
    'jsdoc/check-examples': 0, // Enable again once supported.
    'jsdoc/check-indentation': 0,
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-syntax': 1,
    'jsdoc/check-tag-names': 1,
    'jsdoc/check-types': 1,
    'jsdoc/newline-after-description': 1,
    'jsdoc/no-undefined-types': 0,
    'jsdoc/require-description': 0,
    'jsdoc/require-description-complete-sentence': 0, // @returns broken.
    'jsdoc/require-example': 0,
    'jsdoc/require-param': 1,
    'jsdoc/require-param-description': 1,
    'jsdoc/require-param-name': 1,
    'jsdoc/require-param-type': 1,
    'jsdoc/require-returns': 0,
    'jsdoc/require-returns-check': 1,
    'jsdoc/require-returns-description': 1,
    'jsdoc/require-returns-type': 1,
    'jsdoc/valid-types': 0, // Enable again when bothered to fix the typing.
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
