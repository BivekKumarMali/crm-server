import { autoInjectable } from 'tsyringe'
import { NextFunction, Request, Response, Router } from 'express'
import AuthMiddleware from '../middleware/auth.middleware'
import HttpException from '../shared/http/httpException'
import { UtilService } from '../service/util.service'
import ContactService from '../service/contact.service'
import { CreateContactDto, UpdateContactDto } from '../dto/contact.dto'
@autoInjectable()
export default class ContactController {
  private router: Router
  constructor(
    private readonly utilService: UtilService,
    private readonly contactService: ContactService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router()
    // this.findAllContact = this.findAllContact.bind(this)
    this.createContact = this.createContact.bind(this)
    // this.updateContact = this.updateContact.bind(this)
    // this.deleteContact = this.deleteContact.bind(this)
  }

  // async findAllContact(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | unknown> {
  //   try {
  //     const result = await this.contactService.findAllLContacts(
  //       req.params.listId
  //     )
  //     return res.status(result.statusCode).send(result)
  //   } catch (err: any) {
  //     next(err)
  //   }
  // }

  async createContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        CreateContactDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.contactService.createContact(
        req.params.listId,
        validatedDto.data,
        req.user
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  // async updateContact(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | unknown> {
  //   try {
  //     const validatedDto = await this.utilService.validateDTO(
  //       UpdateContactDto,
  //       req.body
  //     )
  //     if (validatedDto.errors) {
  //       throw new HttpException(validatedDto.errors, 400, 'Bad Request')
  //     }
  // const result = await this.contactService.updateContact(
  //   req.params.listId,
  //   req.params.contactId,
  //   validatedDto.data
  // )
  // return res.status(result.statusCode).send(result)
  //   } catch (err: any) {
  //     next(err)
  //   }
  // }

  // async deleteContact(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | unknown> {
  //   try {
  //     const result = await this.contactService.deleteContact(
  //       req.params.listId,
  //       req.params.contactId
  //     )
  //     return res.status(result.statusCode).send(result)
  //   } catch (err: any) {
  //     next(err)
  //   }
  // }

  public routes(): Router {
    // this.router.get(
    //   '/findAllTeam/:listId',
    //   [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
    //   this.findAllContact
    // )
    this.router.post(
      '/create/:listId',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.createContact
    )
    // this.router.patch(
    //   '/updateTeam/:listId/:contactId',
    //   [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
    //   this.updateContact
    // )
    // this.router.delete(
    //   '/deleteTeam/:listId/:contactId',
    //   [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
    //   this.deleteContact
    // )

    return this.router
  }
}
