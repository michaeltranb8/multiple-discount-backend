import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import bodyParser from 'body-parser'

import Shopify from '../lib/Shopify'
import { getStoreWithAccessToken } from '../lib/accessToken'
import installClient from '../actions/installClient'
import installWebhooks from '../actions/installWebhooks'

const router = Router()

router.post('/', bodyParser.json(), asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const shopify = Shopify.fromStore(store)
  await installClient(shopify)
  await installWebhooks(shopify)
  res.json({})
}))

export default router
