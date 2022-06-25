import { NextFunction, Request, Response } from 'express'

export default function defaultErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ('fields' in err) {
    // validation error
    console.error(err)
    res.status(422).json({ error: 'validation error', fields: err.fields })
  } else {
    console.error(err)
    res.status(401).json({ error: err.message })
  }
}
