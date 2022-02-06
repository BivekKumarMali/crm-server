import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  BeforeRemove,
  BeforeUpdate,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Role, Status } from '../constants/enums/user.enum'
import { Exclude } from 'class-transformer'
import { Base } from './base.entity'
import { Team } from './team.entity'
import { MemberRole } from '../constants/enums/member.enum'
import { List } from './list.entity'

@Entity('user')
export class User extends Base {
  @Column({ nullable: true })
  creatorId: string

  @Column()
  name: string

  @Column({ unique: true })
  username: string

  @Column()
  countryCode: string

  @Column({ unique: true })
  phoneNumber: string

  @Column({ type: 'boolean', default: false })
  isPhoneNumberVerified: boolean

  @Column({
    unique: true,
  })
  email: string

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean

  @Exclude()
  @Column()
  password: string

  @Exclude()
  @Column({ type: 'enum', enum: Status, default: Status.active })
  status: Status

  @Exclude()
  @Column({ type: 'simple-array', default: () => `('${Role.user}')` })
  roles: Role[]

  @Column({ type: 'boolean', default: true })
  crmAccess: boolean

  @Column({ type: 'boolean', default: true })
  modifyMember: boolean

  @Column({ type: 'boolean', default: true })
  skipCall: boolean

  @Column({ type: 'boolean', default: true })
  allListAccess: boolean

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.manager })
  memberRole: MemberRole

  @ManyToMany(() => Team, (team) => team.users)
  teams: Team[]

  @ManyToMany(() => List, (list) => list.users)
  lists: List[]

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    const passwordInPlaintext = this.password
    this.password = await bcrypt.hash(passwordInPlaintext, 10)
  }
}
