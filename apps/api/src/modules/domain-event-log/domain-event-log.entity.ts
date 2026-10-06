import { Column, CreateDateColumn, Entity } from 'typeorm'
import type { DomainEventLogUuid } from './domain-event-log.uuid.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

@Entity()
export class DomainEventLog {
  @CreateDateColumn({ type: 'timestamptz', primary: true })
  createdAt: Date

  @Column({ type: 'uuid', generated: 'uuid', primary: true })
  uuid: DomainEventLogUuid

  @Column({ type: 'int4' })
  version: number

  @Column({ type: 'varchar' })
  source: string

  @Column({ type: 'varchar' })
  type: DomainEventType

  @Column({ type: 'varchar', nullable: true })
  subjectType: DomainEventSubjectType | null

  @Column({ type: 'uuid', nullable: true })
  subjectId: string | null

  @Column({ type: 'jsonb' })
  content: object

  @Column({ type: 'varchar', nullable: true })
  actorType: DomainEventActorType | null

  @Column({ type: 'varchar', nullable: true })
  actorId: string | null

  @Column({ type: 'varchar', nullable: true })
  traceId: string | null
}
