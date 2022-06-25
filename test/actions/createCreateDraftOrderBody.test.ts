import '../support/setup'

import Big from 'big.js'
import { getRepository } from 'typeorm'

import createCreateDraftOrderBody from '../../src/actions/createCreateDraftOrderBody'
import findOrCreateStore from '../../src/actions/findOrCreateStore'
import Rule from '../../src/entities/Rule'
import { getTomorrow, getYesterday } from '../support/dateHelper'
import MockShopify from '../support/MockShopify'

const shop = 'test.myshopify.com'

describe('createCreateDraftOrderBody', () => {
  test('works', async () => {
    const store = await findOrCreateStore(shop)
    const rule = new Rule()
    rule.store = store
    rule.status = true
    rule.customerGroups = []
    rule.applyMethod = 'fixed_amount'
    rule.applyAmount = new Big(5)
    rule.startAt = getYesterday()
    rule.endAt = getTomorrow()
    rule.bundleItems = [
      {
        productVariantIds: ['15'],
        collectionIds: [],
        quantity: 1
      }
    ]
    await getRepository(Rule).save(rule)

    const mock = new MockShopify(store)
    mock.addMockVariant('15', { id: '15', product_id: '10', price: '100.00' })

    const result = await createCreateDraftOrderBody(
      store,
      {
        token: 'whatever',
        note: 'whatever',
        items: [{ product_id: '10', variant_id: '15', quantity: 5 }]
      },
      { id: 1, tags: [] }
    )
    expect(result).toEqual({
      draft_order: {
        line_items: [
          {
            variant_id: 15,
            quantity: 5,
            applied_discount: {
              title: 'Discount',
              description: '',
              value_type: 'fixed_amount',
              value: '0.0000',
              amount: '0.0000'
            }
          }
        ]
      }
    })
  })
})
