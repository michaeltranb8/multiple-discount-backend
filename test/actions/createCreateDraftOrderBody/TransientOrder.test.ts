import '../../support/setup'

import Big from 'big.js'

import TransientOrder from '../../../src/actions/createCreateDraftOrderBody/TransientOrder'
import findOrCreateStore from '../../../src/actions/findOrCreateStore'
import MockShopify from '../../support/MockShopify'

const shop = 'test.myshopify.com'

describe('TransientOrder', () => {
  describe('addCart', () => {
    test('adds cart items', async () => {
      const store = await findOrCreateStore(shop)
      const order = new TransientOrder(store)
      const mock = new MockShopify(store)
      mock.addMockVariant('1', {
        id: '1',
        product_id: '1',
        price: '100.00'
      })
      await order.addCart({
        token: 'whatever',
        note: 'whatever',
        items: [{ product_id: '1', variant_id: '1', quantity: 3 }]
      })
      await order.load()
      expect(order.items.length).toEqual(3)
      expect(order.items[0].price).toEqual(new Big(100))
    })
  })
})
