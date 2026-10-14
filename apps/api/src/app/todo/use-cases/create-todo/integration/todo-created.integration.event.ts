import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class TodoCreatedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: TodoUuid

  constructor (uuid: TodoUuid) {
    this.uuid = uuid
  }
}

export class TodoCreatedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'TodoCreatedIntegrationEventType',
    enum: [IntegrationEventType.TODO_CREATED]
  })
  declare type: IntegrationEventType.TODO_CREATED

  @ApiProperty({ type: TodoCreatedIntegrationEventContent })
  declare data: TodoCreatedIntegrationEventContent

  constructor (uuid: TodoUuid) {
    super({
      type: IntegrationEventType.TODO_CREATED,
      data: new TodoCreatedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const TodoCreatedNatsSubject = 'project-template.{env}.todo.{uuid}.created'
export const TodoCreatedChannel = createChannel(TodoCreatedNatsSubject, {
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
    sendTodoCreated: {
      action: 'send',
      summary: 'this is message is sent when a new todo is created',
      messages: [TodoCreatedIntegrationEvent]
    }
  }
})
