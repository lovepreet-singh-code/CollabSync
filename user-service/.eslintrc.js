module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    env: {
        node: true,
        es6: true,
        jest: true
    },
    rules: {
        'prettier/prettier': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
    }
};