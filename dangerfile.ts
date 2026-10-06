// Dangerfile.ts (TypeScript supported!)
import type { DefaultConfig, Rule } from '@wisemen/danger/dist/lib/index.js'

export function configureDanger (baseConfig: DefaultConfig): DefaultConfig {
  return {
    ...baseConfig,
    rules: {
      ...baseConfig.rules,
      'conventional-commits': {
        enabled: true,
        checkTitle: true,
        checkCommitMessages: true,
        checkDescription: false
      },
      'changelog-updated': {
        enabled: true
      }
    }
  }
}

export const rules: Record<string, Rule> = {
} // Add local rules here
