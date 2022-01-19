import jwt, { JwtPayload } from 'jsonwebtoken'
import { IJWTPayload, IJWTToken } from 'src/constants/interfaces/jwt.interface'

export function generateJWTToken(
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

export function verifyJWTToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret)
}
