import tseslint from 'typescript-eslint';
import eslintPluginReact from 'eslint-plugin-react';

export default tseslint.config(
  // Configuration for project source files
  {
    files: ['client/src/**/*.{ts,tsx}', 'server/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}'],
    ignores: ["dist/**", "client/public/**"],
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
  // Configuration for eslint.config.js and other config/script files that don't need type-aware linting or might cause issues
  {
    files: ['eslint.config.js', 'script/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    rules: {
      // No specific rules for config files currently, but can be added here.
    },
  }
);
