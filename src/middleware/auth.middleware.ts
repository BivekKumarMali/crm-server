import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'
import config from 'config'
import HttpException from '../shared/http/httpException'
import UserService from '../service/user.service'
import { verifyJWTToken } from '../utils/jwt.util'

@injectable()
export default class AuthMiddleware {
  constructor(private readonly userService: UserService) {
      this.isAuthorized = this.isAuthorized.bind(this)
  }

  async isAuthorized(req: Request, res: Response, next: NextFunction) {
    try {
      const token =
        req.headers.authorization && req.headers.authorization.split(' ')[1]

      if (!token) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      const payload = verifyJWTToken(token, config.get('ACCESS_TOKEN_SECRET'))
      const user = await this.userService.findById(payload.id)

      if (!user) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      req.user = user

      next()
    } catch (err: any) {
      if (err.message === 'invalid token') {
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
}
