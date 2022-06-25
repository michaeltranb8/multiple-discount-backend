import '../support/setup'

import request from 'supertest'

import putStore from '../../src/actions/putStore'
import app from '../../src/application'
import Store from '../../src/entities/Store'
import { generateHMAC } from '../../src/lib/hmac'

const shop = 'kef-test.myshopify.com'
const shopifyAccessToken = 'random-shopify-access-token'

describe('access_token routes', () => {
  test('POST /', async () => {
    const store = await putStore({ shop, shopifyAccessToken })
    const query = `shop=${store.shop}`
    const response = await request(app).post(`/access_token?hmac=${generateHMAC(query)}&${query}`)
    expect(response.status).toBe(200)
    const accessToken = response.body.accessToken
    const foundStore = await Store.verifyAccessToken(accessToken)

    if (foundStore) {
      expect(store.id).toEqual(foundStore.id)
    } else {
      fail('Expected a store to be found')
    }
  })
})
