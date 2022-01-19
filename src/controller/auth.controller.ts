import { Router, Request, Response, NextFunction } from 'express'
import { autoInjectable } from 'tsyringe'
import UserService from '../service/user.service'
import { validateDTO } from '../utils/dto.util'
import { SendOTPDto, SigninDto, SignupDto, VerifyOTPDto } from '../dto/auth.dto'
import HttpException from '../shared/http/httpException'
import AuthMiddleware from '../middleware/auth.middleware'

@autoInjectable()
export default class AuthController {
  private router: Router

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthMiddleware
  ) {
    this.router = Router()
    this.signup = this.signup.bind(this)
    this.signin = this.signin.bind(this)
    this.sendOTPToSignin = this.sendOTPToSignin.bind(this)
    this.verifyOTPAndSignin = this.verifyOTPAndSignin.bind(this)
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedDto = await validateDTO(SignupDto, req.body)
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.signup(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedDto = await validateDTO(SigninDto, req.body)
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.signin(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async sendOTPToSignin(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedDto = await validateDTO(SendOTPDto, req.body)
      if (validatedDto.errors) {
        throw new HttpException(validatedDto.errors, 400, 'Bad Request')
      }
      const result = await this.userService.sendOTPToSignin(validatedDto.data)
      return res.status(result.statusCode).send(result)
    } catch (err: any) {
      next(err)
    }
  }

  async verifyOTPAndSignin(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedDto = await validateDTO(VerifyOTPDto, req.body)
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

  public routes(): Router {
    this.router.post('/signup', this.signup)
    this.router.post('/signin', this.signin)
    this.router.post('/sendOTPToSignin', this.sendOTPToSignin)
    this.router.post('/verifyOtpAndSignin', this.verifyOTPAndSignin)
    return this.router
  }
}
