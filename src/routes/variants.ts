import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import bodyParser from 'body-parser'

import Shopify from '../lib/Shopify'
import { getStoreWithAccessToken } from '../lib/accessToken'
import ShopifyCache from '../lib/ShopifyCache'

const router = Router()

// https://promo-dev-store.myshopify.com/admin/api/2021-01/variants.json
const shopifyURLPattern = new RegExp('https://.+/admin/api/2021-01/variants.json', 'g')

router.get('/:id', bodyParser.json(), asyncHandler(async (req, res) => {
  const { cache } = await getStoreWithAccessToken(req)
  cache.addProductVariant(req.params.id)
  await cache.load()
  res.json(cache.productVariants[req.params.id])
}))

export default router
