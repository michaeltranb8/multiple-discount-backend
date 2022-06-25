import MockAdapter from 'axios-mock-adapter'
import Store from '../../src/entities/Store'

import {
  ShopifyCollection,
  ShopifyProduct,
  ShopifyVariant
} from '../../src/lib/Shopify'

export default class MockShopify {
  store: Store
  mock: MockAdapter

  constructor(store: Store) {
    this.store = store
    this.mock = new MockAdapter(store.shopify.axios, {
      onNoMatch: 'throwException'
    })
  }

  addMockVariant(id: string, variant: ShopifyVariant) {
    const url = `https://${this.store.shop}/admin/api/2021-01/variants/${id}.json`
    this.mock.onGet(url).reply(200, { variant })
  }

  addMockCollection(id: string, collection: ShopifyCollection) {
    const url = `https://${this.store.shop}/admin/api/2021-01/collections/${id}.json`
    this.mock.onGet(url).reply(200, { collection })
  }

  addCollectionProducts(id: string, products: ShopifyProduct[]) {
    const url = `https://${this.store.shop}/admin/api/2021-01/collections/${id}/products.json`
    this.mock.onGet(url).reply(200, { products })
  }
}
