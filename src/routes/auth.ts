import { Router } from 'express'
import asyncHandler from 'express-async-handler'

import putStore from '../actions/putStore'
import { verifyQueryWithHMAC } from '../lib/hmac'
import Shopify from '../lib/Shopify'

const router = Router()

router.get('/callback', asyncHandler(async (req, res) => {
  const query = verifyQueryWithHMAC(req)
  const code = String(query.code)
  const shop = String(query.shop)
  const shopifyAccessToken = await Shopify.createAccessToken(shop, code)
  const store = await putStore({ shop, shopifyAccessToken })
  const accessToken = store.generateAccessToken()

  res.json({ message: 'success', shop, accessToken })
}))

export default router
