import type { DataSource } from 'typeorm'

export const customPostgresDataTypes = [
  'tstzrange3',
  'tstzmultirange3'
] as const

export function registerCustomPostgresDataTypes (dataSource: DataSource): void {
  const supportedDataTypes = dataSource.driver.supportedDataTypes as string[]

  for (const dataType of customPostgresDataTypes) {
    if (!supportedDataTypes.includes(dataType)) {
      supportedDataTypes.push(dataType)
    }
  }
}
