import { DomainEvent, type SubjectedEventOptions } from '@wisemen/nestjs-domain-events'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { DomainEventSubjectType } from '#src/modules/domain-events/domain-event-subject-type.enum.js'

export class TodoEvent<Content extends object> extends DomainEvent<Content> {
  constructor (
    options: SubjectedEventOptions<Content, {
      todoUuid: TodoUuid
    }>
  ) {
    super({
      ...options,
      subjectId: options.todoUuid,
      subjectType: DomainEventSubjectType.TODO
    })
  }
}
