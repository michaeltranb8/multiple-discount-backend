import { Request } from 'express'
import { FindOneOptions } from 'typeorm'
import Store from '../entities/Store'

function getAccessTokenFromQuery (req: Request) {
  return req.query.accessToken || req.body?.accessToken
}

function getAccessTokenFromHeader (req: Request) {
  // extract access token from authorization header
  // the header should contains value "Bearer ACCESS_TOKEN"
  const authorization = req.headers.authorization
  if (!authorization) {
    throw new Error('no authorization headers')
  }

  const match = authorization.match(/Bearer (.+)/)
  if (!match) {
    throw new Error('invalid authorization header')
  }

  const accessToken = match[1]
  if (!accessToken) {
    throw new Error('no access token in the authorization header')
  }

  return accessToken
}

function getAccessToken (req: Request) {
  return getAccessTokenFromQuery(req) || getAccessTokenFromHeader(req)
}

export async function getStoreWithAccessToken (req: Request, options?: FindOneOptions<Store>) {
  const accessToken = getAccessToken(req)
  const store = await Store.verifyAccessToken(accessToken, options)
  if (store) {
    return store
  } else {
    throw new Error('invalid or expired authorization header')
  }
}
