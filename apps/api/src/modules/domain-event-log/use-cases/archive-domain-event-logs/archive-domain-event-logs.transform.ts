import { Transform, type TransformCallback } from 'node:stream'

interface ArchivedDomainEventLogRow {
  uuid: string
  createdAt: Date | string
  version: number
  source: string
  type: string
  subjectType: string | null
  subjectId: string | null
  actorType: string | null
  actorId: string | null
  content: object | string
  traceId: string | null
}

export class ArchiveDomainEventLogsTransform extends Transform {
  constructor () {
    super({ objectMode: true })
  }

  override _transform (
    chunk: ArchivedDomainEventLogRow,
    _encoding: string,
    callback: TransformCallback
  ): void {
    const createdAt = chunk.createdAt instanceof Date
      ? chunk.createdAt.toISOString()
      : chunk.createdAt

    const content = this.parseContent(chunk.content)

    this.push(JSON.stringify({
      uuid: chunk.uuid,
      createdAt,
      version: chunk.version,
      source: chunk.source,
      type: chunk.type,
      subjectType: chunk.subjectType,
      subjectId: chunk.subjectId,
      actorType: chunk.actorType,
      actorId: chunk.actorId,
      content,
      traceId: chunk.traceId
    }) + '\n')

    callback()
  }

  private parseContent (content: ArchivedDomainEventLogRow['content']): unknown {
    if (typeof content !== 'string') {
      return content
    }

    return JSON.parse(content) as unknown
  }
}
