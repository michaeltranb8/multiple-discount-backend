import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import JSONBigInt from 'json-bigint'
import { getRepository } from 'typeorm'

import createOrderDiscounts from '../../actions/createOrderDiscounts'
import { isSubscribed } from '../../actions/isSubscribed'
import Store from '../../entities/Store'
import parseDraftBody from './parseDraftBody'

const router = Router()

export const JSONStringBigInt = JSONBigInt({ storeAsString: true })

router.post(
  '/',
  parseDraftBody,
  asyncHandler(async (req, res) => {
    const draftBody = req.body

    const store = await getRepository(Store).findOne({
      where: { shop: draftBody.shop }
    })
    if (!store) {
      throw new Error('invalid shop')
    }
    if (await isSubscribed(store)) {
      const discounts = await createOrderDiscounts(
        store,
        draftBody,
        draftBody.discountCode
      )

      res.json(discounts)
    } else {
      throw new Error('is not subscribed')
    }
  })
)

export default router
