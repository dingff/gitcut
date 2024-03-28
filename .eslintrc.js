module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:prettier/recommended'],
  globals: {
    chrome: true,
    window: true,
    module: true,
    process: true,
    require: true,
    __dirname: true,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
        printWidth: 120,
      },
    ],
    'no-undef': 'error',
    'no-unused-vars': 'error',
  },
}
