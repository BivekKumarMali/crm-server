import HttpResponse from '../shared/http/httpResponse'
import { injectable } from 'tsyringe'
import HttpException from '../shared/http/httpException'
import { plainToInstance } from 'class-transformer'
import { User } from '../entities/user.entity'
import { getConnection, Raw } from 'typeorm'
import { List } from '../entities/list.entity'
import { Contact } from '../entities/contact.entity'
import { CreateContactDto, UpdateContactDto } from '../dto/contact.dto'

@injectable()
export default class ContactService {
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

  async findAll(listId: string): Promise<Contact[]> {
    try {
      const contacts = await getConnection()
        .getRepository(Contact)
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.list', 'list')
        .where('list.id = :id', { id: listId })
        .getMany()

      return contacts
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
  async create(
    userId: string,
    listId: string,
    contact: CreateContactDto
  ): Promise<Contact | null> {
    try {
      const list = await getConnection()
        .getRepository(List)
        .createQueryBuilder('list')
        .leftJoinAndSelect('list.users', 'users')
        .where('list.id = :listId', { listId })
        .andWhere('users.id IN(:userId)', { userId })
        .orWhere('list.creatorId = :creatorId', { creatorId: userId })
        .getOne()

      if (!list) {
        return null
      }
      const newContact = Contact.create(contact)
      newContact.list = list
      await newContact.save()
      return newContact
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

  async update(
    userId: string,
    listId: string,
    contactId: string,
    updates: UpdateContactDto
  ): Promise<Contact | null> {
    try {
      const list = await List.findOne({
        where: {
          id: listId,
          users: Raw((alias) => `${alias} IN (:id)`, { id: userId }),
        },
      })

      if (!list) {
        return null
      }
      const contact = await Contact.findOne({ id: contactId })
      if (!contact) {
        return null
      }
      const con = await Contact.update({ id: contactId, list: list }, updates)
      return contact
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

  // async findAllList(user: User): Promise<HttpResponse> {
  //   try {
  //     const lists = await this.findAll(user)
  //     const serializedTeam = plainToInstance(List, lists)
  //     return new HttpResponse({ team: serializedTeam }, 200, 'success')
  //   } catch (err: any) {
  //     if (err instanceof HttpException) {
  //       throw err
  //     }

  //     if (err.sqlMessage) {
  //       throw new HttpException(err.message, 400, 'Bad Request')
  //     }

  //     throw new HttpException()
  //   }
  // }

  async createContact(
    listId: string,
    contact: CreateContactDto,
    user: User
  ): Promise<HttpResponse> {
    try {
      const newContact = await this.create(user.id, listId, contact)
      const serializedTeam = plainToInstance(Contact, newContact)
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

  // async updateList(id: string, updates: UpdateListDto): Promise<HttpResponse> {
  //   try {
  //     const updateList = await this.update(id, updates)
  //     if (!updateList) {
  //       throw new HttpException(null, 404, 'Not Found')
  //     }
  //     const serializedList = plainToInstance(List, updateList)
  //     return new HttpResponse({ team: serializedList }, 200, 'success')
  //   } catch (err: any) {
  //     if (err instanceof HttpException) {
  //       throw err
  //     }

  //     if (err.sqlMessage) {
  //       throw new HttpException(err.message, 400, 'Bad Request')
  //     }

  //     throw new HttpException()
  //   }
  // }

  // async deleteList(id: string): Promise<HttpResponse> {
  //   try {
  //     const isDeleted = await this.delete(id)
  //     if (!isDeleted) {
  //       throw new HttpException(null, 404, 'Not Found')
  //     }
  //     return new HttpResponse(null, 200, 'success')
  //   } catch (err: any) {
  //     if (err instanceof HttpException) {
  //       throw err
  //     }

  //     if (err.sqlMessage) {
  //       throw new HttpException(err.message, 400, 'Bad Request')
  //     }

  //     throw new HttpException()
  //   }
  // }
}
