import '../../support/setup'

import isConditionMatch, {
  isAnyLineItemFinal,
  isGroupMatch
} from '../../../src/actions/createCreateDraftOrderBody/isConditionMatch'
import findOrCreateStore from '../../../src/actions/findOrCreateStore'
import Rule from '../../../src/entities/Rule'
import { createOrder } from '../../support/factories'
import MockShopify from '../../support/MockShopify'

describe('isConditionMatch', () => {
  test('totalSpendingGoal > 10', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant(1, { id: 1, product_id: 1, price: '5.00' })

    const rule = new Rule()
    rule.hasTotalSpendingGoal = true
    rule.totalSpendingGoal = 10
    rule.bundleItems = [
      { productVariantIds: [1], collectionIds: [], quantity: 1 }
    ]
    rule.bundleItemsAggregator = 'all'
    const order1 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 1 }
    ])
    const order2 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 2 }
    ])
    const order3 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 3 }
    ])
    await store.cache.load()
    expect(await isConditionMatch(rule, order1)).toBeFalsy()
    expect(await isConditionMatch(rule, order2)).toBeFalsy()
    expect(await isConditionMatch(rule, order3)).toBeTruthy()
  })

  test('totalSpendingGoal > 10 & isTotalSpendingGoalWithBundledItems', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant(1, { id: 1, product_id: 1, price: '5.00' })
    mock.addMockVariant(2, { id: 2, product_id: 2, price: '20.00' })

    const rule = new Rule()
    rule.hasTotalSpendingGoal = true
    rule.totalSpendingGoal = 10
    rule.bundleItems = [
      { productVariantIds: [1], collectionIds: [], quantity: 1 }
    ]
    rule.bundleItemsAggregator = 'all'
    rule.isTotalSpendingGoalWithBundledItems = true
    const order1 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 1 },
      { product_id: 2, variant_id: 2, quantity: 1 }
    ])
    const order2 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 2 },
      { product_id: 2, variant_id: 2, quantity: 1 }
    ])
    const order3 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 3 },
      { product_id: 2, variant_id: 2, quantity: 1 }
    ])
    expect(await isConditionMatch(rule, order1)).toBeFalsy()
    expect(await isConditionMatch(rule, order2)).toBeFalsy()
    expect(await isConditionMatch(rule, order3)).toBeTruthy()
  })

  test('totalItemsCountGoal > 2', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant(1, { id: 1, product_id: 1, price: '5.00' })

    const rule = new Rule()
    rule.hasTotalItemsGoal = true
    rule.totalItemsCountGoal = 2
    rule.bundleItems = [
      { productVariantIds: [1], collectionIds: [], quantity: 1 }
    ]
    rule.bundleItemsAggregator = 'all'
    const order1 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 1 }
    ])
    const order2 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 2 }
    ])
    const order3 = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 3 }
    ])
    expect(await isConditionMatch(rule, order1)).toBeFalsy()
    expect(await isConditionMatch(rule, order2)).toBeTruthy()
    expect(await isConditionMatch(rule, order3)).toBeTruthy()
  })

  test('order.isFinal = true', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const rule = new Rule()
    const order = await createOrder(store, [])
    order.isFinal = true
    expect(await isConditionMatch(rule, order)).toBeFalsy()
  })
})

describe('isAnyLineItemFinal', () => {
  test('work as expected', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant(1, { id: 1, product_id: 1, price: '5.00' })

    const rule = new Rule()
    rule.bundleItems = [
      { productVariantIds: [1], collectionIds: [], quantity: 1 }
    ]
    rule.offerItems = [
      { productVariantIds: [1], collectionIds: [], quantity: 1 }
    ]

    const order = await createOrder(store, [
      { product_id: 1, variant_id: 1, quantity: 1 }
    ])
    expect(isAnyLineItemFinal(rule, order)).toBeFalsy()
    rule.isIgnoreSubsequentRulesByItem = true
    expect(isAnyLineItemFinal(rule, order)).toBeFalsy()
    order.items[0].isFinal = true
    expect(isAnyLineItemFinal(rule, order)).toBeTruthy()
    rule.isIgnoreSubsequentRulesByItem = false
    expect(isAnyLineItemFinal(rule, order)).toBeFalsy()
  })
})

describe('isGroupMatch', () => {
  describe('customer tags options enabled', () => {
    test('customerIncludeTags', async () => {
      const store = await findOrCreateStore('test.myshopify.com')
      const rule = new Rule()
      rule.bundleItems = []
      rule.customerGroups = ['customerIncludeTags']
      rule.customerIncludeTags = ['a']
      const order1 = await createOrder(store, [])
      order1.setCustomer({ tags: ['a'] })
      expect(isGroupMatch(rule, order1)).toBeTruthy()
      const order2 = await createOrder(store, [])
      order2.setCustomer({ tags: [] })
      expect(isGroupMatch(rule, order2)).toBeFalsy()
      const order3 = await createOrder(store, [])
      order3.setCustomer({ tags: ['b'] })
      expect(isGroupMatch(rule, order3)).toBeFalsy()
    })

    test('customerExcludeTags', async () => {
      const store = await findOrCreateStore('test.myshopify.com')
      const rule = new Rule()
      rule.customerGroups = ['customerExcludeTags']
      rule.customerExcludeTags = ['a']
      const order1 = await createOrder(store, [])
      order1.setCustomer({ tags: ['a'] })
      expect(isGroupMatch(rule, order1)).toBeFalsy()
      const order2 = await createOrder(store, [])
      order2.setCustomer({ tags: [] })
      expect(isGroupMatch(rule, order2)).toBeTruthy()
      const order3 = await createOrder(store, [])
      order3.setCustomer({ tags: ['b'] })
      expect(isGroupMatch(rule, order3)).toBeTruthy()
    })

    test('customerIncludeTags & customerExcludeTags', async () => {
      const store = await findOrCreateStore('test.myshopify.com')
      const rule = new Rule()
      rule.customerGroups = ['customerIncludeTags', 'customerExcludeTags']
      rule.customerIncludeTags = ['a']
      rule.customerExcludeTags = ['b']
      const order1 = await createOrder(store, [])
      order1.setCustomer({ tags: ['a', 'b'] })
      expect(isGroupMatch(rule, order1)).toBeFalsy()
      const order2 = await createOrder(store, [])
      order2.setCustomer({ tags: [] })
      expect(isGroupMatch(rule, order2)).toBeFalsy()
      const order3 = await createOrder(store, [])
      order3.setCustomer({ tags: ['a'] })
      expect(isGroupMatch(rule, order3)).toBeTruthy()
      const order4 = await createOrder(store, [])
      order4.setCustomer({ tags: ['b'] })
      expect(isGroupMatch(rule, order4)).toBeFalsy()
    })

    test('memberOnly', async () => {
      const store = await findOrCreateStore('test.myshopify.com')
      const rule = new Rule()
      rule.customerGroups = ['memberOnly']
      const order1 = await createOrder(store, [])
      order1.setCustomer({ tags: [] })
      expect(isGroupMatch(rule, order1)).toBeFalsy()
      const order2 = await createOrder(store, [])
      order2.setCustomer({ id: 1, tags: [] })
      expect(isGroupMatch(rule, order2)).toBeTruthy()
    })
  })
})
