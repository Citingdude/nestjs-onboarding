import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class TodoUpdatedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: TodoUuid

  constructor (uuid: TodoUuid) {
    this.uuid = uuid
  }
}

export class TodoUpdatedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'TodoUpdatedIntegrationEventType',
    enum: [IntegrationEventType.TODO_UPDATED]
  })
  declare type: IntegrationEventType.TODO_UPDATED

  @ApiProperty({ type: TodoUpdatedIntegrationEventContent })
  declare data: TodoUpdatedIntegrationEventContent

  constructor (uuid: TodoUuid) {
    super({
      type: IntegrationEventType.TODO_UPDATED,
      data: new TodoUpdatedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const TodoUpdatedNatsSubject = 'project-template.{env}.todo.{uuid}.updated'
export const TodoUpdatedChannel = createChannel(TodoUpdatedNatsSubject, {
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
    sendTodoUpdated: {
      action: 'send',
      summary: 'Sent when a todo is updated',
      messages: [TodoUpdatedIntegrationEvent]
    }
  }
})
