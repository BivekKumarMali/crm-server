import { Router, Request, Response, NextFunction } from 'express'
import { autoInjectable } from 'tsyringe'
import UserService from '../service/user.service'
import HttpException from '../shared/http/httpException'
import AuthMiddleware from '../middleware/auth.middleware'
import { UtilService } from '../service/util.service'
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto'

@autoInjectable()
export default class MemberController {
  private router: Router

  constructor(
    private readonly utilService: UtilService,
    private readonly userService: UserService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router()
    this.isAvailableUsername = this.isAvailableUsername.bind(this)
    this.createMember = this.createMember.bind(this)
    this.updateMember = this.updateMember.bind(this)
    this.deleteMember = this.deleteMember.bind(this)
  }

  async isAvailableUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const result = await this.userService.isAvailableUsername(
        req.params.username
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async createMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        CreateMemberDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.createMember(
        validatedDto.data,
        req.user
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async updateMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        UpdateMemberDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.updateMember(
        req.params.memberId,
        validatedDto.data,
        req.user
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const result = await this.userService.deleteMember(
        req.params.memberId,
        req.user
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  public routes(): Router {
    this.router.get('/username/isAvailable/:username', this.isAvailableUsername)
    this.router.post(
      '/create',
      [
        this.authMiddleware.isAuthorized,
        this.authMiddleware.crmAccess,
        this.authMiddleware.isManager,
      ],
      this.createMember
    )
    this.router.patch(
      '/update/:memberId',
      [
        this.authMiddleware.isAuthorized,
        this.authMiddleware.crmAccess,
        this.authMiddleware.isManager,
      ],
      this.updateMember
    )
    this.router.delete(
      '/delete/:memberId',
      [
        this.authMiddleware.isAuthorized,
        this.authMiddleware.crmAccess,
        this.authMiddleware.isManager,
      ],
      this.deleteMember
    )
    return this.router
  }
}
