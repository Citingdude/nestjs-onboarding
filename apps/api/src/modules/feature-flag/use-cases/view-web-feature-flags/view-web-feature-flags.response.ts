import { ApiProperty } from '@nestjs/swagger'

export type ViewWebFeatureFlags = {
  changeAppearance: boolean
  commandMenu: boolean
}

export class ViewWebFeatureFlagsResponse {
  @ApiProperty({ type: 'boolean' })
  changeAppearance: boolean

  @ApiProperty({ type: 'boolean' })
  commandMenu: boolean

  constructor (flags: ViewWebFeatureFlags) {
    this.changeAppearance = flags.changeAppearance
    this.commandMenu = flags.commandMenu
  }
}
