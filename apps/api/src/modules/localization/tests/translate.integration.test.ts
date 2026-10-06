import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { t, tr } from '#src/modules/localization/helpers/translate.helper.js'
import { MISSING_TRANSLATION_KEY } from '#src/modules/localization/constants/defaults.constant.js'
import { LocalizationModule } from '#src/modules/localization/modules/localization.module.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

describe('Translate integration tests', () => {
  let setup: TestSetup

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
  })

  after(async () => {
    await setup.teardown()
  })

  it('falls back to the default translation for an unknown key', () => {
    const unknownKey = 'unkown.key'
    const translation = tr(unknownKey)
    const expectedTranslation = t(MISSING_TRANSLATION_KEY, { args: { key: unknownKey } })

    expect(translation).toBe(expectedTranslation)
  })

  describe('when a translation value is an empty string', () => {
    const emptyKey = 'common.__tbn_1262_empty_key'

    async function withPatchedTranslations (
      patch: Record<Locale, string>,
      run: () => void
    ): Promise<void> {
      const service = LocalizationModule.default()

      if (service === undefined) throw new Error('I18nService is not initialized')

      const original = service.getTranslations()
      const patched = structuredClone(original)

      for (const [locale, value] of Object.entries(patch)) {
        const localeTranslations = patched[locale]

        if (typeof localeTranslations === 'string') {
          throw new Error(`Expected translations for locale ${locale}`)
        }

        const commonTranslations = localeTranslations.common

        if (typeof commonTranslations === 'string') {
          throw new Error(`Expected common translations for locale ${locale}`)
        }

        commonTranslations.__tbn_1262_empty_key = value
      }

      await service.refresh(patched)

      try {
        run()
      } finally {
        await service.refresh(original)
      }
    }

    it('does not recurse infinitely when the fallback locale has an empty value', async () => {
      await withPatchedTranslations(
        { [Locale.EN_US]: '', [Locale.NL_BE]: '' },
        () => {
          const translation = tr(emptyKey, { lang: Locale.EN_US, defaultValue: 'fallback-value' })

          expect(translation).toBe('fallback-value')
        }
      )
    })

    it('falls back to the default language when only the current locale is empty', async () => {
      await withPatchedTranslations(
        { [Locale.EN_US]: 'english-value', [Locale.NL_BE]: '' },
        () => {
          const translation = tr(emptyKey, { lang: Locale.NL_BE, defaultValue: 'fallback-value' })

          expect(translation).toBe('english-value')
        }
      )
    })
  })
})
