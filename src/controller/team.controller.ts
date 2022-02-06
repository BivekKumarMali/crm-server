import TeamService from '../service/team.service'
import { autoInjectable } from 'tsyringe'
import { NextFunction, Request, Response, Router } from 'express'
import AuthMiddleware from '../middleware/auth.middleware'
import { CreateTeamDto, UpdateTeamDto } from '../dto/team.dto'
import HttpException from '../shared/http/httpException'
import { UtilService } from '../service/util.service'

@autoInjectable()
export default class TeamController {
  private router: Router
  constructor(
    private readonly utilService: UtilService,
    private readonly teamService: TeamService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router()
    this.findAllTeam = this.findAllTeam.bind(this)
    this.createTeam = this.createTeam.bind(this)
    this.updateTeam = this.updateTeam.bind(this)
    this.deleteTeam = this.deleteTeam.bind(this)
  }

  async findAllTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const result = await this.teamService.findAllTeam(req.user)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async createTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        CreateTeamDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.teamService.createTeam(
        validatedDto.data,
        req.user
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async updateTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        UpdateTeamDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.teamService.updateTeam(
        req.params.id,
        validatedDto.data
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const result = await this.teamService.deleteTeam(req.params.id)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  public routes(): Router {
    this.router.get(
      '/findAll',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.findAllTeam
    )
    this.router.post(
      '/create',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.createTeam
    )
    this.router.patch(
      '/update/:id',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.updateTeam
    )
    this.router.delete(
      '/delete/:id',
      [this.authMiddleware.isAuthorized, this.authMiddleware.crmAccess],
      this.deleteTeam
    )

    return this.router
  }
}
