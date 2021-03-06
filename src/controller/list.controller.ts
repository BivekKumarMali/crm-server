import { autoInjectable } from 'tsyringe'
import { NextFunction, Request, Response, Router } from 'express'
import AuthMiddleware from '../middleware/auth.middleware'
import { CreateListDto, UpdateListDto } from '../dto/List.dto'
import ListService from '../service/list.service'
import HttpException from '../shared/http/httpException'
import { UtilService } from '../service/util.service'
@autoInjectable()
export default class ListController {
  private router: Router
  constructor(
    private readonly utilService: UtilService,
    private readonly listService: ListService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router()
    this.findAllList = this.findAllList.bind(this)
    this.createList = this.createList.bind(this)
    this.updateList = this.updateList.bind(this)
    this.deleteList = this.deleteList.bind(this)
  }

  async findAllList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const result = await this.listService.findAllList(req.user)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async createList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(CreateListDto, req.body)
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.listService.createList(
        validatedDto.data,
        req.user
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async updateList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        UpdateListDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.listService.updateList(
        req.params.id,
        validatedDto.data
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const result = await this.listService.deleteList(req.params.id)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  public routes(): Router {
    this.router.get(
      '/findAll',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.findAllList
    )
    this.router.post(
      '/create',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.createList
    )
    this.router.patch(
      '/update/:id',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.updateList
    )
    this.router.delete(
      '/delete/:id',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.deleteList
    )

    return this.router
  }
}
