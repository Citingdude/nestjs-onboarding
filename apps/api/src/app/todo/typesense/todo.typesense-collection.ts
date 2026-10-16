import { Typesense, type InferDocumentType } from '@wisemen/nestjs-typesense'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'

export const TodoCollection = Typesense.collection(TypesenseCollectionName.TODO, {
  id: Typesense.string().brand<TodoUuid>(),
  title: Typesense.string().sort().infix(),
  description: Typesense.string().sort().optional(),
  deadline: Typesense.string().optional(),
  completed: Typesense.bool()
})

export type TodoCollection = typeof TodoCollection
export type TodoTypesenseCollection = TodoCollection
export type TypesenseTodo = InferDocumentType<typeof TodoCollection>
