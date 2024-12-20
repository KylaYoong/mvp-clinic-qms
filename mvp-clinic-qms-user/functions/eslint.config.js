import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    // Ignore specific directories
    ignores: ['dist', 'node_modules'],
  },
  {
    // Base configuration for JavaScript files
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Use ES module syntax
      globals: {
        ...globals.browser, // Add browser globals like `window`, `document`
        ...globals.node,    // Add Node.js globals like `require`, `module`, `exports`
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off', // Disable undefined errors for Node.js globals
      'no-unused-vars': 'warn', // Warn for unused variables
    },
  },
  {
    // Additional configuration for React files
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      ecmaFeatures: { jsx: true },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: { version: '18.3' }, // Specify the React version
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
