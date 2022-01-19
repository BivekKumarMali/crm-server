import {
  Entity,
  Column,
  BeforeInsert,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Role, Status } from '../constants/enums/user.enum'
import { Exclude } from 'class-transformer'
import { Base } from './base.entity'

@Entity('user')
export class User extends Base {
  @Column()
  name: string

  @Column({ unique: true })
  username: string

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
  @Column({ type: 'enum', enum: Status, default: Status['active'] })
  status: Status

  @Exclude()
  @Column({ type: 'simple-array', default: () => `('${Role.user}')` })
  roles: Role[]

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    const passwordInPlaintext = this.password
    this.password = await bcrypt.hash(passwordInPlaintext, 10)
  }
}
