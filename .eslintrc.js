module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  'extends': [
    'standard',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  plugins: [
    'chai-friendly',
  ],
  rules: {
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': 'allow-with-description',
      },
    ],
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/consistent-generic-constructors': ['error', 'constructor'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow-as-parameter',
      },
    ],
    '@typescript-eslint/consistent-type-exports': [
      'error',
      {
        fixMixedExportsWithInlineTypeSpecifier: false,
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-base-to-string': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-empty-interface': ['error', {
      allowSingleExtends: true,
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_.*',
        varsIgnorePattern: '^_.*',
      },
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      'nofunc',
    ],
    camelcase: 'error',
    'chai-friendly/no-unused-expressions': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'generator-star-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    'max-len': [
      'error',
      {
        code: 100,
        tabWidth: 2,
      },
    ],
    'no-console': 'off',
    'no-dupe-keys': 'error',
    'no-undef': 'off',
    'no-var': 'error',
    'no-unused-expressions': 'off',
    'no-useless-constructor': 'off',
    'prefer-template': 'error',
    quotes: [
      'error',
      'single',
      { avoidEscape: true },
    ],
    'quote-props': [
      'error',
      'as-needed',
      {
        keywords: true,
        unnecessary: true,
        numbers: true,
      },
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
  },
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        'max-len': [
          'error',
          {
            code: 100,
            tabWidth: 2,
            ignoreStrings: true,
          },
        ],
      },
    },
    {
      files: ['.eslintrc.cjs'],
      rules: {
        'max-len': 'off',
      },
    },
  ],
}
