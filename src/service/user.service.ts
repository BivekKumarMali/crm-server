import { injectable } from 'tsyringe'
import { plainToInstance } from 'class-transformer'
import * as bcrypt from 'bcrypt'
import twilio from 'twilio'
import config from 'config'
import { User } from '../entities/user.entity'
import {
  RefreshTokenDto,
  SendOTPDto,
  SigninDto,
  SignupDto,
  VerifyOTPDto,
} from '../dto/auth.dto'
import HttpResponse from '../shared/http/httpResponse'
import HttpException from '../shared/http/httpException'
import { generateJWTToken, verifyJWTToken } from '../utils/jwt.util'
import Redis from '../db/redis'

@injectable()
export default class UserService {
  constructor(public readonly redis: Redis) {}

  async findById(id: string): Promise<User> {
    try {
      const user = await User.findOne(id)
      if (!user) {
        throw new HttpException(null, 404, 'Not Found')
      }
      return user
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      throw new HttpException()
    }
  }

  async signup(user: SignupDto): Promise<HttpResponse> {
    try {
      const newUser = User.create(user)
      await newUser.save()
      const serializedUser = plainToInstance(User, newUser)
      return new HttpResponse({ user: serializedUser }, 201, 'success')
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

  async signin(credentials: SigninDto): Promise<HttpResponse> {
    try {
      const { username, email, password } = credentials
      const user = await User.findOne({ where: [{ username }, { email }] })
      if (!user) {
        throw new HttpException(null, 404, 'Not Found')
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        throw new HttpException(null, 404, 'Not Found')
      }

      const { token: accessToken } = generateJWTToken(
        { id: user.id },
        config.get('ACCESS_TOKEN_SECRET'),
        `${
          (config.get('ACCESS_TOKEN_SECRET_EXPIRES_HRS') as number) *
          60 *
          60 *
          1000
        }`
      )

      const { token: refreshToken } = generateJWTToken(
        { id: user.id },
        config.get('REFRESH_TOKEN_SECRET'),
        `${
          (config.get('REFRESH_TOKEN_SECRET_EXPIRES_HRS') as number) *
          60 *
          60 *
          1000
        }`
      )
      await this.redis.set(
        user.id,
        refreshToken,
        (config.get('REFRESH_TOKEN_SECRET_EXPIRES_HRS') as number) * 60 * 60
      )
      return new HttpResponse({ accessToken, refreshToken }, 200, 'success')
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

  async sendOTP(contactDetail: SendOTPDto): Promise<HttpResponse> {
    try {
      const { phoneNumber } = contactDetail
      const client = twilio(
        config.get('TWILIO_ACCOUNT_SID'),
        config.get('TWILIO_AUTH_TOKEN')
      )
      const otp = Math.floor(100000 + Math.random() * 900000)

      client.messages.create({
        body: `Dear Customer, you have requested for CRM OTP ${otp}. This OTP will expire in 3 mins.`,
        from: config.get('TWILIO_PHONE_NUMBER'),
        to: `+91${phoneNumber}`,
      })

      await this.redis.set(phoneNumber, `${otp}`, 180)
      return new HttpResponse(
        { message: `OTP sent to +91${phoneNumber}` },
        200,
        'success'
      )
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      throw new HttpException()
    }
  }

  async sendOTPToSignin(contactDetail: SendOTPDto): Promise<HttpResponse> {
    try {
      const { phoneNumber } = contactDetail

      const user = await User.findOne({ where: [{ phoneNumber }] })

      if (!user) {
        throw new HttpException(null, 404, 'Not Found')
      }
      return this.sendOTP(contactDetail)
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

  async verifyOTPAndSignin(credentials: VerifyOTPDto): Promise<HttpResponse> {
    try {
      const { phoneNumber, otp } = credentials
      const sharedOtp = await this.redis.get(phoneNumber)
      if (otp !== sharedOtp) {
        throw new HttpException(['invalid OTP'], 404, 'Not Found')
      }
      await this.redis.del(phoneNumber)
      const user = await User.findOne({ where: [{ phoneNumber }] })

      if (!user) {
        throw new HttpException(null, 404, 'Not Found')
      }

      if (!user.isPhoneNumberVerified) {
        user.isPhoneNumberVerified = true
        await user.save()
      }

      const { token: accessToken } = generateJWTToken(
        { id: user.id },
        config.get('ACCESS_TOKEN_SECRET'),
        `${(config.get('ACCESS_TOKEN_SECRET_EXPIRES_HRS') as number) * 60 * 60}`
      )

      const { token: refreshToken } = generateJWTToken(
        { id: user.id },
        config.get('REFRESH_TOKEN_SECRET'),
        `${
          (config.get('REFRESH_TOKEN_SECRET_EXPIRES_HRS') as number) * 60 * 60
        }`
      )
      await this.redis.set(
        user.id,
        refreshToken,
        (config.get('REFRESH_TOKEN_SECRET_EXPIRES_HRS') as number) * 60 * 60
      )
      return new HttpResponse({ accessToken, refreshToken }, 200, 'success')
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

  async refreshToken(tokens: RefreshTokenDto): Promise<HttpResponse> {
    try {
      const { refreshToken } = tokens
      const payload = verifyJWTToken(
        refreshToken,
        config.get('REFRESH_TOKEN_SECRET') as string
      )

      const cachedToken = await this.redis.get(payload.id)

      if (refreshToken !== cachedToken) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      const user = await User.findOne({
        id: payload.id,
      })

      if (!user) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      const { token: accessToken } = generateJWTToken(
        { id: user.id },
        config.get('ACCESS_TOKEN_SECRET'),
        `${(config.get('ACCESS_TOKEN_SECRET_EXPIRES_HRS') as number) * 60 * 60}`
      )

      return new HttpResponse({ accessToken }, 200, 'success')
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      if (
        err.message === 'invalid token' ||
        err.message === 'invalid signature'
      ) {
        throw new HttpException('Invalid Token', 401, 'Unauthorized')
      }

      if (err.message === 'jwt expired') {
        throw new HttpException('Session Timeout', 401, 'Unauthorized')
      }

      if (err.sqlMessage) {
        throw new HttpException(err.message, 400, 'Bad Request')
      }

      throw new HttpException()
    }
  }

  async signout(tokens: RefreshTokenDto): Promise<HttpResponse> {
    try {
      const { refreshToken } = tokens
      const payload = verifyJWTToken(
        refreshToken,
        config.get('REFRESH_TOKEN_SECRET') as string
      )

      await this.redis.del(payload.id)
      return new HttpResponse()
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      }

      if (
        err.message === 'invalid token' ||
        err.message === 'invalid signature'
      ) {
        throw new HttpException('Invalid Token', 401, 'Unauthorized')
      }

      if (err.message === 'jwt expired') {
        throw new HttpException('Session Timeout', 401, 'Unauthorized')
      }

      throw new HttpException()
    }
  }
}
