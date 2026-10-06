/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common'

@Injectable()
export class NoopRedisClient {
  async getCachedValue<T> (): Promise<T | null> {
    return null
  }

  async getCachedValues<T> (keys: string[]): Promise<Array<T | null>> {
    return new Array<T | null>(keys.length).fill(null)
  }

  async putCachedValue (): Promise<void> {}

  async putCachedValues (): Promise<void> {}

  async setLock (): Promise<{ success: boolean, token: string | null }> {
    return { success: false, token: null }
  }

  async releaseLock (): Promise<boolean> {
    return false
  }

  async deleteCachedValue (): Promise<void> {}

  async deleteCachedValues (): Promise<void> {}
}
