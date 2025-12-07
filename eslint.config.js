import tseslint from 'typescript-eslint';
import eslintPluginReact from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: ["dist/**"],
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
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
    },
  },
);
