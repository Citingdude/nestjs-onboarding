import type { User } from '#src/modules/auth/users/entities/user.entity.js'

export interface TestUser {
  user: User
  token: string
}
