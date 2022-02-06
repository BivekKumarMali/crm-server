import { injectable } from 'tsyringe'
import { plainToInstance } from 'class-transformer'
import * as bcrypt from 'bcrypt'
import config from 'config'
import { User } from '../entities/user.entity'
import {
  CreateUserDto,
  RefreshTokenDto,
  SendOTPDto,
  SigninDto,
  VerifyOTPDto,
} from '../dto/auth.dto'
import HttpResponse from '../shared/http/httpResponse'
import HttpException from '../shared/http/httpException'
import Redis from '../db/redis'
import TeamService from './team.service'
import axios from 'axios'
import QueryString from 'qs'
import { UtilService } from './util.service'
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto'
import { Team } from '../entities/team.entity'
import { MemberRole } from '../constants/enums/member.enum'
import { getConnection } from 'typeorm'
import { List } from '../entities/list.entity'

@injectable()
export default class UserService {
  constructor(
    private readonly redis: Redis,
    private readonly utilService: UtilService,
    private readonly teamService: TeamService
  ) {}

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

  async create(user: CreateUserDto, creatorId?: string): Promise<User> {
    try {
      const newUser = User.create({ ...user, creatorId })
      await newUser.save()
      return newUser
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

  async isAvailableUsername(username: string): Promise<HttpResponse> {
    try {
      const user = await User.findOne({ username })
      if (user) {
        return new HttpResponse({ availibility: false }, 200, 'success')
      }
      return new HttpResponse({ availibility: true }, 200, 'success')
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      }

      throw new HttpException()
    }
  }

  async signup(user: CreateUserDto): Promise<HttpResponse> {
    try {
      const { company: defaultTeamName } = user
      if (defaultTeamName) {
        delete user.company
      }
      const newUser = await this.create(user)
      if (defaultTeamName) {
        const team = await this.teamService.create({
          creatorId: newUser.id,
          name: defaultTeamName,
        })
        newUser.teams = [team]
        await newUser.save()
      }
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

      const { token: accessToken } = this.utilService.generateJWTToken(
        { id: user.id },
        config.get('ACCESS_TOKEN_SECRET'),
        `${
          (config.get('ACCESS_TOKEN_SECRET_EXPIRES_HRS') as number) *
          60 *
          60 *
          1000
        }`
      )

      const { token: refreshToken } = this.utilService.generateJWTToken(
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
      const { countryCode, phoneNumber } = contactDetail

      const otp = Math.floor(100000 + Math.random() * 900000)
      // const message = `Dear Customer, you have requested for CRM OTP ${otp}. This OTP will expire in 3 mins.`
      const message = `Hi User, OTP for your transaction on GS Digital (Gupshup) SMS Sandbox is ${otp}. Please enter to continue.`
      let data = {
        destination: `${countryCode}${phoneNumber}`,
        message,
        source: '',
      }

      if (countryCode === '+91') {
        data.source = 'GSDSMS'
      }

      const dataStr = QueryString.stringify(data)

      const authorization = config.get('SMS_AUTHORIZATION') as string
      const options = {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
      const res = await axios.post(
        `${config.get('SMS_API') as string}`,
        dataStr,
        options
      )
      if (res.data.status !== 'success') {
        throw new HttpException(null, 500, 'Internal Server Error')
      }
      await this.redis.set(phoneNumber, `${otp}`, 180)
      return new HttpResponse(
        { message: `OTP sent to ${countryCode}${phoneNumber}` },
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

      const { token: accessToken } = this.utilService.generateJWTToken(
        { id: user.id },
        config.get('ACCESS_TOKEN_SECRET'),
        `${
          (config.get('ACCESS_TOKEN_SECRET_EXPIRES_HRS') as number) *
          60 *
          60 *
          1000
        }`
      )

      const { token: refreshToken } = this.utilService.generateJWTToken(
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
        (config.get('REFRESH_TOKEN_SECRET_EXPIRES_HRS') as number) *
          60 *
          60 *
          1000
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
      const payload = this.utilService.verifyJWTToken(
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

      const { token: accessToken } = this.utilService.generateJWTToken(
        { id: user.id },
        config.get('ACCESS_TOKEN_SECRET'),
        `${
          (config.get('ACCESS_TOKEN_SECRET_EXPIRES_HRS') as number) *
          60 *
          60 *
          1000
        }`
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
      const payload = this.utilService.verifyJWTToken(
        refreshToken,
        config.get('REFRESH_TOKEN_SECRET') as string
      )

      await this.redis.del(payload.id)
      return new HttpResponse()
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

      throw new HttpException()
    }
  }

  async createMember(
    member: CreateMemberDto,
    user: User
  ): Promise<HttpResponse> {
    try {
      const team = await getConnection()
        .getRepository(Team)
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.users', 'users')
        .where('team.id = :teamId', { teamId: member.teamId })
        .orWhere('users.id IN(:id)', { id: user.id })
        .getOne()
      if (!team) {
        throw new HttpException('Invalid Team Id', 400, 'Bad Request')
      }

      if (member.memberRole === MemberRole.manager) {
        throw new HttpException(null, 401, 'Unauthorized')
      }

      if (member.memberRole === MemberRole.agent) {
        member.crmAccess = false
        member.modifyMember = false
        member.allListAccess = false
      }

      const newMember = await this.create(member, user.id)
      if (!newMember.teams) {
        newMember.teams = [team]
      } else {
        newMember.teams.push(team)
      }
      newMember.save()
      const serializedUser = plainToInstance(User, newMember)
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

  async updateMember(
    memberId: string,
    updates: UpdateMemberDto,
    user: User
  ): Promise<HttpResponse> {
    try {
      const member = await User.findOne({ creatorId: user.id })
      if (!member) {
        throw new HttpException('Invalid Member Id', 400, 'Bad Request')
      }

      if (updates.memberRole === MemberRole.agent) {
        updates.crmAccess = false
        updates.modifyMember = false
        updates.allListAccess = false
      }

      if (!updates.memberRole && member.memberRole === MemberRole.agent) {
        delete updates.crmAccess
        delete updates.modifyMember
        delete updates.allListAccess
      }
      const result = await User.update({ id: memberId }, updates)
      if (result.affected !== 1) {
        throw new HttpException('Invalid Update', 400, 'Bad Request')
      }
      return new HttpResponse({}, 200, 'success')
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

  async deleteMember(memberId: string, user: User): Promise<HttpResponse> {
    try {
      //TODO delete member
      const obj = await getConnection()
        .getRepository(User)
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.teams', 'teams')
        .leftJoinAndSelect('user.lists', 'lists')
        .where('user.id = :memberId', { memberId })
        .andWhere('user.creatorId = :userId', { userId: user.id })
        .getOne()

      if (!obj) {
        throw new HttpException('Invalid Member Id', 400, 'Bad Request')
      }
      obj.teams.map(async (team) => {
        if (team.creatorId === user.id) {
          await Team.delete(team)
        }
      })

      obj.teams = []

      obj.lists.map(async (list) => {
        if (list.creatorId === user.id) {
          await List.delete(list)
        }
      })

      obj.lists = []
      await obj.save()
      const result = await User.delete(obj)
      return new HttpResponse({}, 200, 'success')
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
}
