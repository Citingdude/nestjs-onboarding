import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum MimeType {
  PDF = 'application/pdf',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT = 'text/plain',
  HTML = 'text/html',
  CSV = 'text/csv',
  NDJSON = 'application/x-ndjson',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  TIFF = 'image/tiff',
  BMP = 'image/bmp',
  HEIC = 'image/heic',
  WEBP = 'image/webp',
  GIF = 'image/gif',
  OCTET_STREAM = 'application/octet-stream'
}

export function MimeTypeApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: MimeType,
    enumName: 'MimeType'
  })
}

export const MimeTypeSuffix: Record<MimeType, string> = {
  [MimeType.PDF]: 'pdf',
  [MimeType.DOC]: 'doc',
  [MimeType.DOCX]: 'docx',
  [MimeType.PPT]: 'ppt',
  [MimeType.PPTX]: 'pptx',
  [MimeType.TXT]: 'txt',
  [MimeType.HTML]: 'html',
  [MimeType.CSV]: 'csv',
  [MimeType.NDJSON]: 'ndjson',
  [MimeType.JPEG]: 'jpeg',
  [MimeType.PNG]: 'png',
  [MimeType.TIFF]: 'tiff',
  [MimeType.BMP]: 'bmp',
  [MimeType.HEIC]: 'heic',
  [MimeType.WEBP]: 'webp',
  [MimeType.GIF]: 'gif',
  [MimeType.OCTET_STREAM]: 'bin'
}
