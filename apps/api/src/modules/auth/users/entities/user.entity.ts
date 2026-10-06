import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, type Relation, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm'
import type { UserUuid } from './user.uuid.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: UserUuid

  @Column({ type: 'varchar', unique: true })
  userId: string

  @CreateDateColumn({ precision: 3 })
  createdAt: Date

  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date

  @DeleteDateColumn({ precision: 3 })
  deletedAt: Date

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  email: string

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null

  @OneToMany(() => UserRole, role => role.user)
  userRoles?: Array<Relation<UserRole>>

  get fullName (): string {
    return this.firstName + ' ' + this.lastName
  }
}
