import { Entity, Column, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { Contact } from './contact.entity'

@Entity('list')
export class List extends Base {
  @Column()
  name: string

  @OneToMany(() => Contact, (contact) => contact.list)
  contacts: Contact[]
}
