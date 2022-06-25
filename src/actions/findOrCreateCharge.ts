import qs from 'qs'
import { getRepository } from 'typeorm'

import Store from '../entities/Store'
import { isSubscribed } from './isSubscribed'

export default async function findOrCreateCharge (store: Store) {
  if (await isSubscribed(store)) {
    return { subscribed: true }
  } else {
    const returnURL = process.env.SHOPIFY_RETURN_URI + '?' + qs.stringify({
      shop: store.shop,
      access_token: store.generateAccessToken()
    })
    const shop = await store.shopify.getShop()
    const isTest = (
      process.env.SHOPIFY_TEST === 'true' ||
      shop.plan_name === 'affiliate' ||
      shop.plan_name === 'partner_test'
    )
    const response = await store.shopify.createCharge({
      recurring_application_charge: {
        name: 'Monthly Plan',
        price: '39.99',
        trial_days: 14,
        return_url: returnURL,
        test: isTest
      }
    })
    const {
      recurring_application_charge: { id, confirmation_url: confirmationURL }
    } = response.data
    await getRepository(Store).update(store.id, { chargeId: id, subscriptionState: 'pending' })

    return { confirmationURL, shop: store.shop }
  }
}
