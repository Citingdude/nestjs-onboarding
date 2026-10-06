---
name: api-enums
description: Use when creating, reviewing, or modifying enums in a backend api
---

# Enums

## Core rules

- Create one separate TypeScript file per enum, named `<enumName>.enum.ts` in a folder `enums` under the relevant module or component.
- Export the enum from that file.
- Add an `<EnumName>ApiProperty` decorator when the enum is used in commands, queries, responses, or DTOs and must appear in OpenAPI documentation.
- Add an `<EnumName>Column` decorator when the enum is persisted as a TypeORM entity column.
- Keep OpenAPI `enumName` values stable and readable.
- Keep database `enumName` values stable, lowercase, and snake_case.

## File contents

A complete enum file may contain:

- The TypeScript enum.
- The API property decorator, only when needed.
- The TypeORM column decorator, only when needed.

## Define typescript enum

Use uppercase enum keys and lowercase string values.

```ts title="enums/ui-theme.enum.ts"
export enum UiTheme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
  DARK_BLUE = 'dark-blue'
}
```

## OpenAPI ApiProperty decorator

Add this only when the enum is used in commands, queries, responses, or DTOs.

```ts title="enums/ui-theme.enum.ts"
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'

export function UiThemeApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: UiTheme,
    enumName: 'UITheme'
  })
}
```

## TypeORM Column decorator

Add this only when the enum is stored as a TypeORM entity column.

```ts title="enums/ui-theme.enum.ts"
import { Column, ColumnOptions } from 'typeorm'

type UiThemeColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>

export function UiThemeColumn (
  options?: UiThemeColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: UiTheme,
    enumName: 'ui_theme'
  })
}
```

## Naming conventions

For an enum named UiTheme:

- Typescript filename: ui-theme.enum.ts
- Enum type: UiTheme
- OpenAPI decorator: UiThemeApiProperty
- OpenAPI enumName: UiTheme
- TypeORM Column decorator: UiThemeColumn
- Database enumName: ui_theme
- TypeORM Column options type: UiThemeColumnOptions
