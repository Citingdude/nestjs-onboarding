import { randomUUID } from 'crypto'
import * as os from 'node:os'
import { ApiProperty } from '@nestjs/swagger'
import { IntegrationEventType, IntegrationEventTypeApiProperty } from './integration-event.type.js'

/**
 * Represents an event which originates from this system, and is sent to other external systems
 * Follows the spec from https://cloud.google.com/eventarc/docs/workflows/cloudevents
 */
export class IntegrationEvent<Content = object> {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string

  @ApiProperty({ type: 'string', format: 'date-time' })
  time: string

  @ApiProperty({ type: 'string' })
  datacontenttype: string

  @ApiProperty({ type: 'string' })
  source: string

  @IntegrationEventTypeApiProperty()
  type: IntegrationEventType

  @ApiProperty({ type: 'string' })
  specversion: string

  @ApiProperty({ type: 'object', properties: {} })
  data: Content

  constructor (options: {
    type: IntegrationEventType
    version: string | number
    data: Content
  }) {
    this.id = randomUUID()
    this.source = os.hostname()
    this.time = new Date().toISOString()
    this.type = options.type
    this.specversion = String(options.version)
    this.datacontenttype = 'application/json'
    this.data = options.data
  }
}
