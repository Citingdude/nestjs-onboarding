import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation, Unique } from 'typeorm'
import { Role } from './role.entity.js'
import type { RoleUuid } from './role.uuid.js'
import type { UserRoleUuid } from './user-role.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Entity()
@Unique(['userUuid', 'roleUuid'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  uuid: UserRoleUuid

  @Column({ type: 'uuid' })
  userUuid: UserUuid

  @Index()
  @Column({ type: 'uuid' })
  roleUuid: RoleUuid

  @ManyToOne(() => User, user => user.userRoles)
  @JoinColumn({ name: 'user_uuid' })
  user?: Relation<User>

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_uuid' })
  role?: Relation<Role>
}
