import { CreateTeamDto, UpdateTeamDto } from '../dto/team.dto'
import HttpResponse from '../shared/http/httpResponse'
import { injectable } from 'tsyringe'
import { Team } from '../entities/team.entity'
import HttpException from '../shared/http/httpException'
import { plainToInstance } from 'class-transformer'
import { User } from '../entities/user.entity'
import { getConnection } from 'typeorm'

@injectable()
export default class TeamService {
  async findOne(id: string): Promise<Team | null> {
    try {
      const team = await Team.findOne({ id })
      if (!team) {
        return null
      }
      return team
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async findAll(user: User): Promise<Team[]> {
    try {
      const teams = await getConnection()
        .getRepository(Team)
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.users', 'users')
        .where('users.id IN(:userid)', { id: user.id })
        .orWhere('team.creatorId = :creatorId', { creatorId: user.id })
        .getMany()

      return teams
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }
  async create(team: CreateTeamDto): Promise<Team> {
    try {
      const newTeam = Team.create(team)
      await newTeam.save()
      return newTeam
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async update(id: string, updates: UpdateTeamDto): Promise<Team | null> {
    try {
      const team = await Team.findOne({ id })
      if (!team) {
        return null
      }

      if (updates.name) {
        team.name = updates.name
      }

      if (updates.description) {
        team.description = updates.description
      }

      team.save()
      return team
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Team.delete({ id })
      return result.affected === 0
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async findAllTeam(user: User): Promise<HttpResponse> {
    try {
      const teams = await this.findAll(user)
      const serializedTeam = plainToInstance(Team, teams)
      return new HttpResponse({ team: serializedTeam }, 200, 'success')
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async createTeam(team: CreateTeamDto, user: User): Promise<HttpResponse> {
    try {
      const newTeam = await this.create({ ...team, creatorId: user.id })
      newTeam.users = [user]
      await newTeam.save()
      const serializedTeam = plainToInstance(Team, newTeam)
      return new HttpResponse({ team: serializedTeam }, 201, 'success')
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async updateTeam(id: string, updates: UpdateTeamDto): Promise<HttpResponse> {
    try {
      const updateTeam = await this.update(id, updates)
      if (!updateTeam) {
        throw new HttpException(null, 404, 'Not Found')
      }
      const serializedTeam = plainToInstance(Team, updateTeam)
      return new HttpResponse({ team: serializedTeam }, 200, 'success')
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async deleteTeam(id: string): Promise<HttpResponse> {
    try {
      const team = await getConnection()
        .getRepository(Team)
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.users', 'users')
        .getOne()

      if (!team) {
        throw new HttpException(null, 404, 'Not Found')
      }

      if (team.users && team.users.length > 0) {
        throw new HttpException(null, 400, 'Bad Request')
      }

      await this.delete(id)
      return new HttpResponse(null, 200, 'success')
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }
}
