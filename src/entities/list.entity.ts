import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { Contact } from './contact.entity'
import { User } from './user.entity'

@Entity('list')
export class List extends Base {
  @Column()
  creatorId: string

  @Column()
  name: string

  @OneToMany(() => Contact, (contact) => contact.list)
  contacts: Contact[]

  @ManyToMany(() => User, (user) => user.lists)
  @JoinTable({
    name: 'list_user',
    joinColumn: {
      name: 'list',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
  })
  users: User[]
}
