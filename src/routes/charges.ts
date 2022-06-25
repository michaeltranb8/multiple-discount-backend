import bodyParser from 'body-parser'
import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { getRepository } from 'typeorm'

import findOrCreateCharge from '../actions/findOrCreateCharge'
import { isSubscribed } from '../actions/isSubscribed'
import Store from '../entities/Store'
import { getStoreWithAccessToken } from '../lib/accessToken'

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const response = await findOrCreateCharge(store)
  res.json(response)
}))

router.post('/', bodyParser.json(), asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  store.chargeId = req.body.chargeId
  if (await isSubscribed(store)) {
    store.subscriptionState = 'subscribed'
    await getRepository(Store).save(store)
    res.json({})
  } else {
    throw new Error('charge is not active')
  }
}))

export default router
