import { Router, Request, Response, NextFunction } from 'express'
import { autoInjectable } from 'tsyringe'
import UserService from '../service/user.service'
import {
  CreateUserDto,
  RefreshTokenDto,
  SendOTPDto,
  SigninDto,
  VerifyOTPDto,
} from '../dto/auth.dto'
import HttpException from '../shared/http/httpException'
import AuthMiddleware from '../middleware/auth.middleware'
import { UtilService } from '../service/util.service'

@autoInjectable()
export default class AuthController {
  private router: Router

  constructor(
    private readonly utilService: UtilService,
    private readonly userService: UserService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router()
    this.signup = this.signup.bind(this)
    this.signin = this.signin.bind(this)
    this.sendOTPToSignin = this.sendOTPToSignin.bind(this)
    this.verifyOTPAndSignin = this.verifyOTPAndSignin.bind(this)
    this.refreshToken = this.refreshToken.bind(this)
    this.signout = this.signout.bind(this)
  }

  async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(CreateUserDto, req.body)
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.signup(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async signin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        SigninDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.signin(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async sendOTPToSignin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        SendOTPDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.sendOTPToSignin(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async verifyOTPAndSignin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        VerifyOTPDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.verifyOTPAndSignin(
        validatedDto.data
      )
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        RefreshTokenDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }

      const result = await this.userService.refreshToken(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err) {
      next(err)
    }
  }

  async signout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | unknown> {
    try {
      const validatedDto = await this.utilService.validateDTO(
        RefreshTokenDto,
        req.body
      )
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }

      const result = await this.userService.signout(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err) {
      next(err)
    }
  }

  public routes(): Router {
    // this.router.post(
    //   '/signup',
    //   [this.authMiddleware.isAuthorized, this.authMiddleware.isAdmin],
    //   this.signup
    // )
    this.router.post('/signup', this.signup)
    this.router.post('/signin', this.signin)
    this.router.post('/sendOTPToSignin', this.sendOTPToSignin)
    this.router.post('/verifyOtpAndSignin', this.verifyOTPAndSignin)
    this.router.post('/refreshToken', this.refreshToken)
    this.router.delete('/signout', this.signout)
    return this.router
  }
}
