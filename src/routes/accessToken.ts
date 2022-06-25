import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { getRepository } from 'typeorm'
import Store from '../entities/Store'

import { getStoreWithAccessToken } from '../lib/accessToken'
import { verifyQueryWithHMAC } from '../lib/hmac'

const router = Router()

router.post('/', asyncHandler(async (req, res) => {
  const query = verifyQueryWithHMAC(req)
  const shop = String(query.shop)
  const store = await getRepository(Store).findOne({ shop })

  if (!store) {
    throw new Error('invalid access token')
  }

  res.json({
    shop: store.shop,
    accessToken: store.generateAccessToken()
  })
}))

router.post('/verify', asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  res.json({
    shop: store.shop,
    accessToken: store.generateAccessToken()
  })
}))

export default router
