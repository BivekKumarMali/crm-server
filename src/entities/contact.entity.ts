import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Base } from './base.entity'
import { Disposition } from '../constants/enums/disposition.enum'
import { List } from './list.entity'
import { IsNotEmpty, ValidateIf } from 'class-validator'

@Entity('contact')
export class Contact extends Base {
  @Column()
  primaryCountryCode: string

  @Column()
  primaryContactNumber: string

  @Column({ nullable: true })
  @IsNotEmpty()
  @ValidateIf((obj) => obj.secondaryContactNumber)
  secondaryCountryCode: string

  @Column({ nullable: true })
  secondaryContactNumber: string

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  company: string

  @Column({ type: 'enum', enum: Disposition, default: Disposition.new })
  disposition: Disposition

  @Column({ nullable: true })
  extra: string

  @Column({ nullable: true })
  remarks: string

  @Column({ nullable: true })
  note: string

  @ManyToOne(() => List, (list) => list.contacts)
  @JoinColumn({
    name: 'listId',
  })
  list: List
}
