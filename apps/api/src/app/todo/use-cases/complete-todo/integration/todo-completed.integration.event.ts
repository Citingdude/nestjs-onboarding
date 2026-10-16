import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class TodoCompletedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: TodoUuid

  constructor (uuid: TodoUuid) {
    this.uuid = uuid
  }
}

export class TodoCompletedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'TodoCompletedIntegrationEventType',
    enum: [IntegrationEventType.TODO_COMPLETED]
  })
  declare type: IntegrationEventType.TODO_COMPLETED

  @ApiProperty({ type: TodoCompletedIntegrationEventContent })
  declare data: TodoCompletedIntegrationEventContent

  constructor (uuid: TodoUuid) {
    super({
      type: IntegrationEventType.TODO_COMPLETED,
      data: new TodoCompletedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const TodoCompletedNatsSubject = 'project-template.{env}.todo.{uuid}.completed'
export const TodoCompletedChannel = createChannel(TodoCompletedNatsSubject, {
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
    sendTodoCompleted: {
      action: 'send',
      summary: 'Sent when a todo is completed',
      messages: [TodoCompletedIntegrationEvent]
    }
  }
})
