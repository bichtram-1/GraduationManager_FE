// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
  },

  // JS recommended
  js.configs.recommended,

  // TS recommended
  ...tseslint.configs.recommended,

  // React recommended
  pluginReact.configs.flat.recommended,

  // Prettier
  eslintConfigPrettier,

  // 👇 Override cuối cùng để chắc chắn không bị ghi đè
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-multiple-empty-lines': [
        'error',
        { max: 1, maxEOF: 1, maxBOF: 0 },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
