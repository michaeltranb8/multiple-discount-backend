import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export function encodeJWT(data: string | object | Buffer, options: SignOptions = {}) {
  return jwt.sign(data, JWT_SECRET, options)
}

export function decodeJWT(token: string, options: VerifyOptions = {}) {
  return jwt.verify(token, JWT_SECRET, options)
}
