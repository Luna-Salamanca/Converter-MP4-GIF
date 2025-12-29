import tseslint from 'typescript-eslint'
import eslintPluginReact from 'eslint-plugin-react'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    files: ['client/src/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}'],
    ignores: ['dist/**', 'client/public/**'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: eslintPluginReact,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReact.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['eslint.config.js', 'script/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    rules: {},
  },
  eslintConfigPrettier
)
