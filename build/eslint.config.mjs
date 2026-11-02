export default [
  {
    files: ['**/*.mjs'],
    ignores: ['node_modules/**', '.stryker-tmp/**', 'reports/**'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: { complexity: ['error', 8] },
  },
];
