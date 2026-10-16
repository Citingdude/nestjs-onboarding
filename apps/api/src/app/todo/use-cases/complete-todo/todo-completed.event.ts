import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoEvent } from '#src/app/todo/events/todo-event.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class TodoCompletedContent {
  constructor (readonly uuid: TodoUuid) {}
}

@RegisterDomainEvent(DomainEventType.TODO_COMPLETED, 1)
export class TodoCompletedEvent extends TodoEvent<TodoCompletedContent> {
  constructor (uuid: TodoUuid) {
    super({
      todoUuid: uuid,
      content: new TodoCompletedContent(uuid)
    })
  }
}
