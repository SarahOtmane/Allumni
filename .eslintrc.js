module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  env: {
    node: true,
    jest: true
  },
  rules: {
    // Add any root-specific rules here
    'prettier/prettier': 'error'
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/', 'client/', 'server/'] // Ignore project specific folders, handled by their own config
};