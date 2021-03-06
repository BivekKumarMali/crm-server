import HttpResponse from '../shared/http/httpResponse'
import { injectable } from 'tsyringe'
import HttpException from '../shared/http/httpException'
import { plainToInstance } from 'class-transformer'
import { User } from '../entities/user.entity'
import { getConnection } from 'typeorm'
import { List } from '../entities/list.entity'
import { CreateListDto, UpdateListDto } from 'src/dto/list.dto'

@injectable()
export default class ListService {
  async findOne(id: string): Promise<List | null> {
    try {
      const list = await List.findOne({ id })
      if (!list) {
        return null
      }
      return list
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

  async findAll(user: User): Promise<List[]> {
    try {
      const lists = await getConnection()
        .getRepository(List)
        .createQueryBuilder('list')
        .leftJoinAndSelect('list.users', 'users')
        .where('list.creatorId = :creatorId', { creatorId: user.id })
        .orWhere('users.id IN(:userId)', { userId: user.id })
        .getMany()

      return lists
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
  async create(list: CreateListDto): Promise<List> {
    try {
      const newList = List.create(list)
      await newList.save()
      return newList
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

  async update(id: string, updates: UpdateListDto): Promise<List | null> {
    try {
      const list = await List.findOne({ id })
      if (!list) {
        return null
      }

      if (updates.name) {
        list.name = updates.name
      }
      list.save()
      return list
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
      const result = await List.delete({ id })
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

  async findAllList(user: User): Promise<HttpResponse> {
    try {
      const lists = await this.findAll(user)
      const serializedList = plainToInstance(List, lists)
      return new HttpResponse({ lists: serializedList }, 200, 'success')
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

  async createList(list: CreateListDto, user: User): Promise<HttpResponse> {
    try {
      const newList = await this.create({ ...list, creatorId: user.id })
      const serializedList = plainToInstance(List, newList)
      return new HttpResponse({ list: serializedList }, 201, 'success')
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

  async updateList(id: string, updates: UpdateListDto): Promise<HttpResponse> {
    try {
      const updateList = await this.update(id, updates)
      if (!updateList) {
        throw new HttpException(null, 404, 'Not Found')
      }
      const serializedList = plainToInstance(List, updateList)
      return new HttpResponse({ list: serializedList }, 200, 'success')
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

  async deleteList(id: string): Promise<HttpResponse> {
    try {
      //TODO delete list
      const isDeleted = await this.delete(id)
      if (!isDeleted) {
        throw new HttpException(null, 404, 'Not Found')
      }
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
