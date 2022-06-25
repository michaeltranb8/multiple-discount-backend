import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { getRepository } from 'typeorm'

import createCreateDraftOrderBody from '../../actions/createCreateDraftOrderBody'
import { isSubscribed } from '../../actions/isSubscribed'
import Store from '../../entities/Store'
import parseDraftBody from './parseDraftBody'

const router = Router()

router.post(
  '/',
  parseDraftBody,
  asyncHandler(async (req, res) => {
    const { shop, cart, customer, discountCode } = req.body

    const store = await getRepository(Store).findOne({ where: { shop } })
    if (!store) {
      throw new Error('invalid shop')
    }
    if (await isSubscribed(store)) {
      const createDraftOrderBody = await createCreateDraftOrderBody(
        store,
        cart,
        customer,
        discountCode
      )
      const draft = await store.shopify.createDraftOrder(createDraftOrderBody)

      res.json(draft)
    } else {
      throw new Error('is not subscribed')
    }
  })
)

export default router
