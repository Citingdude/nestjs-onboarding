import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class TodoUncompletedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: TodoUuid

  constructor (uuid: TodoUuid) {
    this.uuid = uuid
  }
}

export class TodoUncompletedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'TodoUncompletedIntegrationEventType',
    enum: [IntegrationEventType.TODO_UNCOMPLETED]
  })
  declare type: IntegrationEventType.TODO_UNCOMPLETED

  @ApiProperty({ type: TodoUncompletedIntegrationEventContent })
  declare data: TodoUncompletedIntegrationEventContent

  constructor (uuid: TodoUuid) {
    super({
      type: IntegrationEventType.TODO_UNCOMPLETED,
      data: new TodoUncompletedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const TodoUncompletedNatsSubject = 'project-template.{env}.todo.{uuid}.uncompleted'
export const TodoUncompletedChannel = createChannel(TodoUncompletedNatsSubject, {
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
    sendTodoUncompleted: {
      action: 'send',
      summary: 'Sent when a todo is marked uncomplete',
      messages: [TodoUncompletedIntegrationEvent]
    }
  }
})
