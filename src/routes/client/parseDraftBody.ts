import { NextFunction, Request, Response } from 'express'
import { JSONStringBigInt } from './discounts'

export default function parseDraftBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let rawBody = ''
  req.setEncoding('utf8')
  req.on('data', (chunk: string) => {
    rawBody += chunk
  })
  req.on('end', () => {
    const body = JSONStringBigInt.parse(rawBody)
    req.body = {
      ...body,
      cart: {
        ...body.cart,
        items: body.cart.items.map((item: any) => ({
          ...item,
          product_id: String(item.product_id),
          variant_id: String(item.variant_id)
        }))
      }
    }
    next()
  })
}
