import { Typesense, type InferDocumentType } from '@wisemen/nestjs-typesense'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

export const UserCollection = Typesense.collection(TypesenseCollectionName.USER, {
  id: Typesense.string().brand<UserUuid>(),
  firstName: Typesense.string().sort().optional(),
  lastName: Typesense.string().sort().optional(),
  email: Typesense.string().sort()
})

export type UserCollection = typeof UserCollection
export type TypesenseUser = InferDocumentType<typeof UserCollection>
