/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-optional-chaining-assign',
        '@babel/plugin-transform-optional-chaining'
    ],
    overrides: [
        {
            files: [
                'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
            ],
            'extends': [
                'plugin:cypress/recommended'
            ]
        }
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        parser: "babel-eslint"
    }
}
