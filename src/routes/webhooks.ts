import bodyParser from 'body-parser'
import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { getRepository } from 'typeorm'

import ShopifyCollectionCache from '../entities/ShopifyCollectionCache'
import ShopifyProductCache from '../entities/ShopifyProductCache'
import Store from '../entities/Store'

const router = Router()

router.post(
  '/products',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    try {
      if (req.headers['X-Shopify-Topic'] === 'products/delete') {
        ShopifyProductCache.purge(req.body)
      } else {
        console.info('Updating product cache', req.body.id)
        ShopifyProductCache.put(req.body)
      }
    } catch (e) {
      console.error(e)
    } finally {
      res.json({})
    }
  })
)

router.post(
  '/collections',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    try {
      if (req.headers['X-Shopify-Topic'] === 'collections/delete') {
        ShopifyCollectionCache.purge(req.body)
      } else {
        console.info('Updating collection cache', req.body.id)
        ShopifyCollectionCache.put(req.body)
      }
    } catch (e) {
      console.error(e)
    } finally {
      res.json({})
    }
  })
)

router.post(
  '/uninstall',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    const repo = getRepository(Store)
    const store = await repo.findOne({ shop: req.body.myshopify_domain })
    if (!store) {
      return res.json({})
    }
    try {
      // do not need to delete charge since shopify will do it while uninstall
      await repo.update(store.id, {
        chargeId: undefined,
        subscriptionState: undefined
      })
    } catch (e) {
      console.error(e)
    } finally {
      res.json({})
    }
  })
)

export default router
