import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import JSONBigInt from 'json-bigint'
import { getRepository } from 'typeorm'

import getAddPrice from '../../actions/getAddPrice'
import Store from '../../entities/Store'
import parseDraftBody from './parseDraftBody'

const router = Router()

const JSONStringBigInt = JSONBigInt({ storeAsString: true })

router.post(
  '/:id',
  parseDraftBody,
  asyncHandler(async (req, res) => {
    const draftBody = req.body
    const productVariantId = parseInt(req.params.id as string)
    const store = await getRepository(Store).findOne({
      where: { shop: draftBody.shop }
    })
    if (!store) {
      throw new Error('invalid shop')
    }

    res.json(await getAddPrice(store, draftBody, productVariantId))
  })
)

router.post(
  '/',
  parseDraftBody,
  asyncHandler(async (req, res) => {
    const draftBody = req.body
    const productVariantIds = req.body.productVariantIds.map(parseInt)
    const store = await getRepository(Store).findOne({
      where: { shop: draftBody.shop }
    })
    if (!store) {
      throw new Error('invalid shop')
    }
    const result: Record<string, any> = {}

    for (const productVariantId of productVariantIds) {
      result[productVariantId] = await getAddPrice(
        store,
        draftBody,
        productVariantId
      )
    }

    res.json(result)
  })
)

export default router
