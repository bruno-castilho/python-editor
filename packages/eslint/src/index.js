import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  ...compat.extends('@rocketseat/eslint-config/next'),
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      camelcase: 'off',
      'no-useless-constructor': 'off',
    },
  },
]
