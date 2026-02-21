import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'dev-dist', '.github', 'coverage', 'test-results', 'node_modules', 'public', '*.config.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'no-use-before-define': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'no-undef': 'warn',
      'no-useless-escape': 'warn',

      // Downgrade other potential errors
      'no-const-assign': 'warn',
      'no-redeclare': 'warn',
      'getter-return': 'warn',
      'no-setter-return': 'warn',
      'no-import-assign': 'warn',
      'no-dupe-args': 'warn',
      'no-dupe-class-members': 'warn',
      'no-dupe-keys': 'warn',
      'no-func-assign': 'warn',

      // Attempt to silence the set-state-in-effect if it's a rule
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]
