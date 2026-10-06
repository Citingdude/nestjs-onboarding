import { AsyncLocalStorage } from 'async_hooks'
import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'

@Injectable()
export class DomainEventLogContext {
  private logStorage = new AsyncLocalStorage<DomainEventLog[]>()

  constructor (
    @InjectRepository(DomainEventLog) private repo: TypeOrmRepository<DomainEventLog>
  ) {}

  addLogs (...logs: DomainEventLog[]): void {
    const storedLogs = this.logStorage.getStore()
    if (storedLogs === undefined) {
      throw new Error('unable to log domain event: store uninitialized')
    }

    storedLogs.push(...logs)
  }

  async runAndCaptureLogs (callback: () => void | Promise<void>): Promise<void> {
    const existingLogs = this.logStorage.getStore()
    if (existingLogs !== undefined) {
      await this.logStorage.run(existingLogs, callback)
      return
    }

    const capturedLogs: DomainEventLog[] = []
    await this.logStorage.run(capturedLogs, callback)

    if (capturedLogs.length > 0) {
      await this.repo.insert(capturedLogs)
    }
  }
}
