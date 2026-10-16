import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoEvent } from '#src/app/todo/events/todo-event.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class TodoUncompletedContent {
  constructor (readonly uuid: TodoUuid) {}
}

@RegisterDomainEvent(DomainEventType.TODO_UNCOMPLETED, 1)
export class TodoUncompletedEvent extends TodoEvent<TodoUncompletedContent> {
  constructor (uuid: TodoUuid) {
    super({
      todoUuid: uuid,
      content: new TodoUncompletedContent(uuid)
    })
  }
}
