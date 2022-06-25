import '../support/setup'

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import request from 'supertest'
import { getRepository } from 'typeorm'

import app from '../../src/application'
import Store from '../../src/entities/Store'
import { generateHMAC } from '../../src/lib/hmac'
import { encodeJWT } from '../../src/lib/jwt'

describe('auth routes', () => {
  test('GET /auth/callback with valid query', async () => {
    const shop = 'kef-test.myshopify.com'
    const code = 'random-code'
    const state = encodeJWT({ type: 'oauth' })
    const query = `code=${code}&state=${state}&shop=${shop}`
    const accessToken = 'secret-access-token'
    const hmac = generateHMAC(query)

    const mock = new MockAdapter(axios)
    const shopifyAccessToken = 'secret-shopify-access-token'
    const storefrontAccessToken = 'secret-storefront-access-token'
    mock.onPost(`https://${shop}/admin/oauth/access_token`)
      .replyOnce(200, { access_token: shopifyAccessToken })

    const response = await request(app)
      .get(`/auth/callback?hmac=${hmac}&${query}`)
      .set('Cookie', [`oauth-nonce=${state}`])

    expect(response.status).toBe(200)

    const repo = getRepository(Store)
    const store = await repo.findOne({ shop })
    if (store) {
      expect(store.shopifyAccessToken).toEqual(shopifyAccessToken)
      expect(response.body.message).toEqual('success')
      expect(response.body.shop).toEqual(shop)
      expect(response.body.accessToken).toBeDefined()
    } else {
      fail('Expected a store to be found')
    }
  })
})
