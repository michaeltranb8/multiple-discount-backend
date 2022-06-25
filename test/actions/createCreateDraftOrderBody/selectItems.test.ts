import '../../support/setup'

import selectItems from '../../../src/actions/createCreateDraftOrderBody/selectItems'
import findOrCreateStore from '../../../src/actions/findOrCreateStore'
import Shopify from '../../../src/lib/Shopify'
import { createOrder } from '../../support/factories'
import MockShopify from '../../support/MockShopify'
import TransientItem from '../../../src/actions/createCreateDraftOrderBody/TransientItem'

const selectVariantId = (item: TransientItem) => item.variantId

describe('selectItems', () => {
  test('one rule item with one order item', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })
    mock.addMockVariant('2', { id: '2', product_id: '2', price: '5.00' })

    const ruleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 1 }
    ]
    const aggregator = 'all'

    const order1 = await createOrder(store, [])
    expect(
      selectItems(order1.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order2 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    expect(
      selectItems(order2.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1])
    const order3 = await createOrder(store, [
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order3.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
  })

  test('one rule item with quantity with many order item', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })
    mock.addMockVariant('2', { id: '2', product_id: '2', price: '5.00' })

    const ruleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 2 }
    ]
    const aggregator = 'all'

    const order1 = await createOrder(store, [])
    expect(
      selectItems(order1.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order2 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    expect(
      selectItems(order2.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order3 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 2 }
    ])
    expect(
      selectItems(order3.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 1])
    const order4 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 3 }
    ])
    expect(
      selectItems(order4.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 1])
    const order5 = await createOrder(store, [
      { product_id: '2', variant_id: '2', quantity: 3 }
    ])
    expect(
      selectItems(order5.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
  })

  test('one rule item with many ids and quantity with many order item', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })
    mock.addMockVariant('2', { id: '2', product_id: '2', price: '5.00' })
    mock.addMockVariant('3', { id: '3', product_id: '3', price: '5.00' })

    const ruleItems = [
      { productVariantIds: ['1', '2'], collectionIds: [], quantity: 2 }
    ]
    const aggregator = 'all'

    const order1 = await createOrder(store, [])
    expect(
      selectItems(order1.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order2 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 2 }
    ])
    expect(
      selectItems(order2.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 1])
    const order3 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 },
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order3.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 2])
    const order4 = await createOrder(store, [
      { product_id: '2', variant_id: '2', quantity: 3 }
    ])
    expect(
      selectItems(order4.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([2, 2])
    const order5 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 3 },
      { product_id: '2', variant_id: '2', quantity: 3 }
    ])
    expect(
      selectItems(order5.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 1])
    const order6 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 },
      { product_id: '3', variant_id: '3', quantity: 3 },
      { product_id: '2', variant_id: '2', quantity: 3 }
    ])
    expect(
      selectItems(order6.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 2])
  })

  test('one rule item with many ids and quantity and different price with many order item', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })
    mock.addMockVariant('2', { id: '2', product_id: '2', price: '3.00' })
    mock.addMockVariant('3', { id: '3', product_id: '3', price: '5.00' })

    const ruleItems = [
      { productVariantIds: ['1', '2'], collectionIds: [], quantity: 2 }
    ]
    const aggregator = 'all'

    const order1 = await createOrder(store, [])
    expect(
      selectItems(order1.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order2 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 2 }
    ])
    expect(
      selectItems(order2.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 1])
    const order3 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 },
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order3.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([2, 1])
    const order4 = await createOrder(store, [
      { product_id: '2', variant_id: '2', quantity: 3 }
    ])
    expect(
      selectItems(order4.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([2, 2])
    const order5 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 3 },
      { product_id: '2', variant_id: '2', quantity: 3 }
    ])
    expect(
      selectItems(order5.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([2, 2])
    const order6 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 2 },
      { product_id: '3', variant_id: '3', quantity: 3 },
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order6.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([2, 1])
  })

  test('two rule items with all aggregator', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })
    mock.addMockVariant('2', { id: '2', product_id: '2', price: '5.00' })

    const ruleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 1 },
      { productVariantIds: ['2'], collectionIds: [], quantity: 1 }
    ]
    const aggregator = 'all'

    const order1 = await createOrder(store, [])
    expect(
      selectItems(order1.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order2 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    expect(
      selectItems(order2.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order3 = await createOrder(store, [
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order3.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order4 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 },
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order4.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1, 2])
  })

  test('two rule items with any aggregator', async () => {
    const store = await findOrCreateStore('test.myshopify.com')
    const mock = new MockShopify(store)
    mock.addMockVariant('1', { id: '1', product_id: '1', price: '5.00' })
    mock.addMockVariant('2', { id: '2', product_id: '2', price: '5.00' })

    const ruleItems = [
      { productVariantIds: ['1'], collectionIds: [], quantity: 1 },
      { productVariantIds: ['2'], collectionIds: [], quantity: 1 }
    ]
    const aggregator = 'any'

    const order1 = await createOrder(store, [])
    expect(
      selectItems(order1.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([])
    const order2 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 }
    ])
    expect(
      selectItems(order2.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1])
    const order3 = await createOrder(store, [
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order3.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([2])
    const order4 = await createOrder(store, [
      { product_id: '1', variant_id: '1', quantity: 1 },
      { product_id: '2', variant_id: '2', quantity: 1 }
    ])
    expect(
      selectItems(order4.items, ruleItems, aggregator).map(selectVariantId)
    ).toEqual([1])
  })
})
