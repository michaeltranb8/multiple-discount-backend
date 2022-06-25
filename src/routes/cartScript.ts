import ejs from 'ejs'
import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import fs from 'fs'
import path from 'path'
import * as ts from 'typescript'

let bodyCache: string | undefined

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
  if (!bodyCache) {
    const templatePath = path.join(__dirname, '/cartScript.ts.ejs')
    const body = ejs.render(fs.readFileSync(templatePath, 'utf-8'))
    bodyCache = ts.transpile(body)
  }
  res.end(bodyCache)
}))

export default router
