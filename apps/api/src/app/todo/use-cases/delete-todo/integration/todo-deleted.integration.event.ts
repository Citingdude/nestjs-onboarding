import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class TodoDeletedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: TodoUuid

  constructor (uuid: TodoUuid) {
    this.uuid = uuid
  }
}

export class TodoDeletedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'TodoDeletedIntegrationEventType',
    enum: [IntegrationEventType.TODO_DELETED]
  })
  declare type: IntegrationEventType.TODO_DELETED

  @ApiProperty({ type: TodoDeletedIntegrationEventContent })
  declare data: TodoDeletedIntegrationEventContent

  constructor (uuid: TodoUuid) {
    super({
      type: IntegrationEventType.TODO_DELETED,
      data: new TodoDeletedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const TodoDeletedNatsSubject = 'project-template.{env}.todo.{uuid}.deleted'
export const TodoDeletedChannel = createChannel(TodoDeletedNatsSubject, {
  parameters: {
    env: {
      enum: Object.values(EnvType),
      description: 'The environment from which the event originates',
      examples: [EnvType.DEVELOPMENT]
    },
    uuid: {
      description: 'The uuid of the todo'
    }
  },
  operations: {
    sendTodoDeleted: {
      action: 'send',
      summary: 'Sent when a todo is deleted',
      messages: [TodoDeletedIntegrationEvent]
    }
  }
})
