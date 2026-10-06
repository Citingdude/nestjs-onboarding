import eslintNestJSConfig from '@wisemen/eslint-config-nestjs'
import eslintImportTypescript from 'eslint-plugin-import-typescript'

export default [
  ...eslintNestJSConfig,
  {
    ignores: [
      'src/modules/localization/generated/i18n.generated.ts'
    ]
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      // or: fixStyle: 'inline-type-imports'
      }],
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@stylistic/padding-line-between-statements': ['off'],
      'import/order': [
        'error',
        {
          warnOnUnassignedImports: true,
          pathGroups: [
            {
              pattern: '#src/modules/opentelemetry/{instrumentation,opentelemetry.config}.js',
              group: 'builtin',
              position: 'before'
            },
            {
              pattern: '#src/utils/opentelemetry/otel-*-sdk.js',
              group: 'builtin',
              position: 'before'
            }
          ]
        }
      ],
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1],
          ignoreReadonlyClassProperties: true,
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false
        }
      ]
    }
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      'no-magic-numbers': 'off'
    }
  },
  {
    plugins: {
      'import-typescript': eslintImportTypescript
    },
    rules: {
      'import-typescript/no-relative-parent-imports': [
        'error', { onlyPathsImport: true }
      ]
    }
  }
]
