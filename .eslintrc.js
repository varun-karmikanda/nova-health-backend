module.exports = {
  env: {
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.json' },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript',
  ],
  plugins: ['@typescript-eslint', 'import', 'boundaries'],
  rules: {
    // Core
    'no-console': 'error',
    'no-await-in-loop': 'error',
    'no-param-reassign': 'error',
    'prefer-destructuring': 'warn',
    'no-shadow': 'off',
    'max-classes-per-file': 'off',
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'object-curly-newline': 'off',
    'no-void': ['error', { allowAsStatement: true }],
    'class-methods-use-this': 'off',

    // TypeScript
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',

    // Imports
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
      },
    ],

    // Layer boundaries
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'controllers', allow: ['services', 'models'] },
          { from: 'services', allow: ['repositories', 'models', 'utils', 'config'] },
          { from: 'repositories', allow: ['models', 'utils', 'config'] },
          { from: 'routes', allow: ['controllers', 'middlewares'] },
          { from: 'middlewares', allow: ['config', 'utils', 'models'] },
          { from: 'utils', allow: [] },
          { from: 'config', allow: [] },
        ],
      },
    ],
  },
  settings: {
    'boundaries/elements': [
      { type: 'controllers', pattern: 'src/controllers/*' },
      { type: 'services', pattern: 'src/services/*' },
      { type: 'repositories', pattern: 'src/repositories/*' },
      { type: 'routes', pattern: 'src/routes/*' },
      { type: 'middlewares', pattern: 'src/middlewares/*' },
      { type: 'models', pattern: 'src/models/*' },
      { type: 'utils', pattern: 'src/utils/*' },
      { type: 'config', pattern: 'src/config/*' },
    ],
  },
};
