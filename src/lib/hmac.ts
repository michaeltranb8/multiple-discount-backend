import { Request } from 'express'
import qs from 'qs'
import crypto from 'crypto'

export function generateHMAC(data: string) {
  const hmacGenerator = crypto.createHmac('sha256', process.env.SHOPIFY_SECRET || '')
  return hmacGenerator.update(data).digest('hex')
}

export function verifyQueryWithHMAC(req: Request) {
  const { hmac, ...rest } = req.query

  if (generateHMAC(qs.stringify(rest)) === hmac) {
    return rest
  } else {
    throw new Error('HMAC verification failed.')
  }
}
