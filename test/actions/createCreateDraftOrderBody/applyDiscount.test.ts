import '../../support/setup'

import Big from 'big.js'

import applyDiscount from '../../../src/actions/createCreateDraftOrderBody/applyDiscount'
import findOrCreateStore from '../../../src/actions/findOrCreateStore'
import Rule from '../../../src/entities/Rule'
import { createOrder } from '../../support/factories'
import MockShopify from '../../support/MockShopify'

const shop = 'test.myshopify.com'

describe('applyDiscount', () => {
  test('applyMethod = fixed_amount', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })

    const rule = new Rule()
    rule.bundleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 1 }
    ]
    rule.isSameItems = true
    rule.bundleItemsAggregator = 'all'
    rule.applyMethod = 'fixed_amount'
    rule.applyAmount = new Big(1)

    const order = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    applyDiscount(rule, order)
    expect(order.items[0].appliedRules).toEqual([
      { rule, discount: new Big(1) }
    ])
  })

  test('applyMethod = percentage', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })

    const rule = new Rule()
    rule.bundleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 1 }
    ]
    rule.isSameItems = true
    rule.bundleItemsAggregator = 'all'
    rule.applyMethod = 'percentage'
    rule.applyAmount = new Big(10)

    const order = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    applyDiscount(rule, order)
    expect(order.items[0].appliedRules).toEqual([
      { rule, discount: new Big(0.5) }
    ])
  })

  test('isIgnoreSubsequentRules = true', async () => {
    const store = await findOrCreateStore('test.myshopify.com')

    const rule = new Rule()
    rule.isIgnoreSubsequentRules = true
    rule.bundleItems = []
    rule.isSameItems = true
    rule.bundleItemsAggregator = 'all'

    const order = await createOrder(store, [])
    applyDiscount(rule, order)
    expect(order.isFinal).toBeTruthy()
  })

  test('maxQuantityOfDiscounts = 2', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })

    const rule = new Rule()
    rule.bundleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 2 }
    ]
    rule.isSameItems = true
    rule.bundleItemsAggregator = 'all'
    rule.applyMethod = 'fixed_amount'
    rule.applyAmount = new Big(1)
    rule.isLimitedTriggerCount = true
    rule.maxQuantityOfDiscounts = 2

    const order = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 5 }
    ])
    applyDiscount(rule, order)
    expect(order.items[0].appliedRules).toEqual([
      { rule, discount: new Big(1) }
    ])
    expect(order.items[1].appliedRules).toEqual([
      { rule, discount: new Big(1) }
    ])
    expect(order.items[2].appliedRules).toEqual([
      { rule, discount: new Big(1) }
    ])
    expect(order.items[3].appliedRules).toEqual([
      { rule, discount: new Big(1) }
    ])
    expect(order.subtotal).toEqual(new Big(21))
  })

  test('isBasedOnDiscountedPrice', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })

    const rule = new Rule()
    rule.bundleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 1 }
    ]
    rule.isSameItems = true
    rule.bundleItemsAggregator = 'all'
    rule.applyMethod = 'percentage'
    rule.applyAmount = new Big(20)
    rule.isBasedOnDiscountedPrice = true

    const order = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    applyDiscount(rule, order)
    applyDiscount(rule, order)
    expect(order.items[0].appliedRules).toEqual([
      { rule, discount: new Big('1') },
      { rule, discount: new Big('0.8') }
    ])
    expect(order.subtotal).toEqual(new Big('3.2'))
  })
})
