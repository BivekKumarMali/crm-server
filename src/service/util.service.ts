import { injectable } from 'tsyringe'
import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'
import _ from 'lodash'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { IJWTPayload, IJWTToken } from '../constants/interfaces/jwt.interface'
import { DtoResult } from '../constants/types/util.type'

@injectable()
export class UtilService {
  /**
   * validate DTO
   * @param {any} DTO Class
   * @param {string} body
   * @returns {DtoResult} data errors
   */
  async validateDTO(dto: any, body: string): Promise<DtoResult> {
    let result: DtoResult = { data: null, errors: null }

    result.data = plainToClass(dto, body)

    const errors = await validate(result.data)
    if (errors.length > 0) {
      result.errors = []
      errors.map((error) => {
        if (error.constraints) {
          result.errors = [
            ...result.errors,
            ...Object.values(error.constraints),
          ]
        }
      })
    }
    return result
  }

  /**
   * generate JWT Token
   * @param {IJWTPayload} payload
   * @param {string} secret
   * @param {string} expiry
   * @returns {IJWTToken} token
   */
  generateJWTToken(
    payload: IJWTPayload,
    secret: string,
    expiry: string
  ): IJWTToken {
    const options = {
      expiresIn: expiry,
    }
    const token = jwt.sign(payload, secret, options)
    return { token }
  }

  /**
   * verify JWT Token
   * @param {string} token
   * @param {string} secret
   * @returns {JwtPayload} payload
   */
  verifyJWTToken(token: string, secret: string): JwtPayload {
    return jwt.verify(token, secret)
  }

  /**
   * generate hash from string
   * @param {string} plainText
   * @param {number} saltRounds
   * @returns {string} hash
   */
  async generateHash(plainText: string, saltRounds: number): Promise<string> {
    return await bcrypt.hash(plainText, saltRounds)
  }

  /**
   * validate plain text with hash
   * @param {string} plainText
   * @param {string} hash
   * @returns {boolean} boolean
   */
  async validateHash(plainText: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hash)
  }

  /**
   * generate random string of specific size
   * @param {number} size
   * @returns {string} random string
   */
  randomString(size: number): string {
    return crypto.randomBytes(size).toString('hex')
  }

  /**
   * deep copy
   * @param {T} value
   * @returns {T} value in new refrence
   */
  deepCopy<T>(value: T): T {
    return _.cloneDeep(value)
  }

  /**
   * removes duplicate objects based on iteratee from an array
   * @param {Array} array
   * @param {T} iteratee
   * @returns {Array} array
   */
  uniqueArrayOfObjects<T>(array: T[], iteratee: T): T[] {
    return _.uniqBy(array, iteratee)
  }

  /**
   * random number between min and max
   * @param {number} min
   * @param {number} max
   * @returns {number} random number
   */
  randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
