import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { getRepository } from 'typeorm'

import Store from '../../entities/Store'

const router = Router()

router.get('/:id', asyncHandler(async (req, res) => {
  const { shop } = req.query
  const { id } = req.params
  const store = await getRepository(Store).findOne({ where: { shop } })
  if (!store) {
    throw new Error('invalid shop')
  }
  const { cache } = store
  cache.addProductVariant(id)
  await cache.load()
  const variant = cache.productVariants[id]
  cache.addProduct(variant.product_id)
  await cache.load()
  const product = cache.products[variant.product_id]
  res.json({ variant, product })
}))

export default router
