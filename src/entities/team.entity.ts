import { Entity, Column, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'

@Entity('team')
export class Team extends Base {
  @Column()
  creatorId: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable({
    name: 'team_user',
    joinColumn: {
      name: 'team',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'user',
      referencedColumnName: 'id'
    }
  })
  users: User[]
}
