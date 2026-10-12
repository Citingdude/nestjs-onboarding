import { RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import type { Todo } from '#src/app/todo/entities/todo.entity.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { TodoEvent } from '#src/app/todo/events/todo-event.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class TodoCreatedContent {
  constructor (readonly uuid: TodoUuid) {}
}

@RegisterDomainEvent(DomainEventType.TODO_CREATED, 1)
export class TodoCreatedEvent extends TodoEvent<TodoCreatedContent> {
  constructor (todo: Todo) {
    super({
      todoUuid: todo.uuid,
      content: new TodoCreatedContent(todo.uuid)
    })
  }
}
