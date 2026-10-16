import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoEvent } from '#src/app/todo/events/todo-event.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class TodoDeletedContent {
  constructor (readonly uuid: TodoUuid) {}
}

@RegisterDomainEvent(DomainEventType.TODO_DELETED, 1)
export class TodoDeletedEvent extends TodoEvent<TodoDeletedContent> {
  constructor (uuid: TodoUuid) {
    super({
      todoUuid: uuid,
      content: new TodoDeletedContent(uuid)
    })
  }
}
