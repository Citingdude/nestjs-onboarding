import { Injectable } from '@nestjs/common'
import { FeatureFlags } from '@wisemen/nestjs-feature-flags'
import { ViewWebFeatureFlagsResponse } from './view-web-feature-flags.response.js'
import { WebCommandMenuFlag } from '#src/modules/feature-flag/web-flags/web-command-menu.flag.js'
import { WebChangeAppearanceFlag } from '#src/modules/feature-flag/web-flags/web-change-appearance.flag.js'

@Injectable()
export class ViewWebFeatureFlagsUseCase {
  constructor (
    private featureFlags: FeatureFlags
  ) {}

  async execute (): Promise<ViewWebFeatureFlagsResponse> {
    const [changeAppearance, commandMenu] = await Promise.all([
      this.featureFlags.get(WebChangeAppearanceFlag),
      this.featureFlags.get(WebCommandMenuFlag)
    ])

    return new ViewWebFeatureFlagsResponse({
      changeAppearance,
      commandMenu
    })
  }
}
