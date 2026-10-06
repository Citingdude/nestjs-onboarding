import { IsDateString, IsDefined, IsNotEmpty, IsString } from 'class-validator'

/**
 * Represents an event which originates from an external system
 * Follows the spec from https://cloud.google.com/eventarc/docs/workflows/cloudevents
 */
export class CloudEvent {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsDateString({ strict: true })
  time: string

  @IsString()
  @IsNotEmpty()
  datacontenttype: string

  @IsString()
  @IsNotEmpty()
  source: string

  @IsString()
  @IsNotEmpty()
  type: string

  @IsString()
  @IsNotEmpty()
  specversion: string

  @IsDefined()
  data: unknown
}
