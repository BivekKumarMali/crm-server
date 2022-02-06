import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'
import config from 'config'
import HttpException from '../shared/http/httpException'
import UserService from '../service/user.service'
import { Role } from '../constants/enums/user.enum'
import { UtilService } from '../service/util.service'
import { MemberRole } from '../constants/enums/member.enum'

@injectable()
export default class AuthMiddleware {
  constructor(
    private readonly utilService: UtilService,
    private readonly userService: UserService
  ) {
    this.isAuthorized = this.isAuthorized.bind(this)
  }

  async isAuthorized(req: Request, res: Response, next: NextFunction) {
    try {
      const token =
        req.headers.authorization && req.headers.authorization.split(' ')[1]

      if (!token) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      const payload = this.utilService.verifyJWTToken(
        token,
        config.get('ACCESS_TOKEN_SECRET')
      )
      const user = await this.userService.findById(payload.id)

      if (!user) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      req.user = user

      next()
    } catch (err: any) {
      if (
        err.message === 'invalid token' ||
        err.message === 'invalid signature'
      ) {
        return next(new HttpException('Invalid Token', 401, 'Unauthorized'))
      }

      if (err.name === 'TokenExpiredError') {
        return next(
          new HttpException('Access Token Expired', 401, 'Unauthorized')
        )
      }

      next(err)
    }
  }

  async isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      if (
        !req.user.roles.includes(Role.admin) ||
        !req.user.roles.includes(Role.superAdmin)
      ) {
        throw new HttpException(null, 401, 'Unauthorized')
      }
      next()
    } catch (err: any) {
      next(err)
    }
  }

  async isManager(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      if (
        req.user.roles.includes(Role.admin) ||
        req.user.roles.includes(Role.superAdmin)
      ) {
        next()
      }

      if (req.user.memberRole !== MemberRole.manager) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      next()
    } catch (err: any) {
      next(err)
    }
  }

  async crmAccess(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user.crmAccess) {
        throw new HttpException(null, 401, 'Unauthorized')
      }
      next()
    } catch (err: any) {
      next(err)
    }
  }
}
