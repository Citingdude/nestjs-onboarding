import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FeatureFlags } from '@wisemen/nestjs-feature-flags'

@Injectable()
export class SyncFeatureFlagConfigUseCase {
  constructor (
    private dataSource: DataSource,
    private flags: FeatureFlags
  ) {}

  async execute (): Promise<void> {
    await this.flags.synchronizeConfig(this.dataSource, { deleteUnknownFlags: true })
  }
}
