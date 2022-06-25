import axios, { AxiosInstance, AxiosResponse } from 'axios'
import JSONBigInt from 'json-bigint'

import Store from '../entities/Store'
import { CreateDraftOrderBody } from '../global'

// this works like JSON except it converts any numbers that length > 15 to string
const JSONStringBigInt = JSONBigInt({ storeAsString: true })

export interface ShopifyCollect {
  id: string
  collection_id: string
  product_id: string
  created_at?: Date
  updated_at?: Date
  position: number
  sort_value: string
}

export interface ShopifyCollection {
  id: string
  // productIds: number[] // NOTE: not exists
  collection_type: 'smart' | 'custom'
}

export interface ShopifyProduct {
  id: string
  variants: ShopifyVariant[]
}

export interface ShopifyVariant {
  error: any
  id: string
  product_id: string
  price: string
}

export interface ShopifyTheme {
  id: string
}

export interface ShopifyAsset {
  key: string
  value: string
}

export interface ShopifyWebhook {
  id: string
  address: string
  topic: string
}

export interface ShopifyRecurringApplicationCharge {
  id: string
  activated_on: string
  confirmation_url?: string
  status: 'pending' | 'active' | 'declined' | 'expired' | 'frozen' | 'cancelled'
}

export interface ShopifyShop {
  plan_name:
    | 'partner_test'
    | 'affiliate'
    | 'basic'
    | 'professional'
    | 'unlimited'
    | 'enterprise'
}

function stringiyfIdForShopifyProduct(product: ShopifyProduct): ShopifyProduct {
  return {
    ...product,
    id: String(product.id),
    variants:
      product.variants && product.variants.map(stringiyfIdForShopifyVariant)
  }
}

function stringiyfIdForShopifyVariant(variant: ShopifyVariant): ShopifyVariant {
  return {
    ...variant,
    id: String(variant.id),
    product_id: String(variant.product_id)
  }
}

function stringiyfIdForShopifyCollection(
  collection: ShopifyCollection
): ShopifyCollection {
  return {
    ...collection,
    id: String(collection.id)
  }
}

function stringiyfIdForRecurringApplicationCharge(
  charge: ShopifyRecurringApplicationCharge
): ShopifyRecurringApplicationCharge {
  return {
    ...charge,
    id: String(charge.id)
  }
}

export default class Shopify {
  shop: string
  accessToken: string
  axios: AxiosInstance
  cache: Record<string, Promise<AxiosResponse>>

  constructor(shop: string, accessToken: string) {
    this.shop = shop
    this.accessToken = accessToken
    this.axios = axios.create({
      baseURL: `https://${shop}`,
      headers: {
        common: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        }
      },
      transformResponse: [data => JSONStringBigInt.parse(data)]
    })
    this.cache = {}
  }

  static fromStore(store: Store) {
    return new Shopify(store.shop, store.shopifyAccessToken)
  }

  async cachedGet<T>(url: string, selector: (data: any) => T) {
    if (!this.cache[url]) {
      this.cache[url] = this.axios.get(url)
    }
    const response = await this.cache[url]
    return {
      data: selector(response.data),
      headers: response.headers
    }
  }

  async getCollectionProducts(id: string) {
    const url = `/admin/api/2021-01/collections/${id}/products.json`
    return await this.cachedGet<ShopifyProduct[]>(url, data =>
      data.products.map(stringiyfIdForShopifyProduct)
    )
  }

  async getCollectionProductsByLink(link: string) {
    return await this.cachedGet<ShopifyProduct[]>(link, data =>
      data.products.map(stringiyfIdForShopifyProduct)
    )
  }

  async getProductVariants(id: string) {
    const url = `/admin/api/2021-04/products/${id}/variants.json`
    return await this.cachedGet<ShopifyVariant[]>(url, data =>
      data.variants.map(stringiyfIdForShopifyVariant)
    )
  }

  async getProducts(query?: string) {
    const url = query
      ? `/admin/api/2021-01/products.json?${query}`
      : '/admin/api/2021-01/products.json?'
    return await this.cachedGet<ShopifyProduct[]>(url, data =>
      data.products.map(stringiyfIdForShopifyProduct)
    )
  }

  async getCollections(query?: string) {
    const url = query
      ? `/admin/api/2021-01/custom_collections.json?${query}`
      : '/admin/api/2021-01/custom_collections.json?'
    return await this.cachedGet<ShopifyCollection[]>(url, data =>
      data.custom_collections.map(stringiyfIdForShopifyCollection)
    )
  }

  async getVariant(id: string) {
    const url = `/admin/api/2021-01/variants/${id}.json`
    try {
      let results: any = await this.cachedGet<ShopifyVariant>(url, data =>
        stringiyfIdForShopifyVariant(data.variant)
      )
      return results
    } catch (error: any) {
      if (error && error.response.status == 404) {
        console.log('404 not found')
        return { data: {}, header: {} }
      }
    }
  }

  async getProduct(id: string) {
    const url = `/admin/api/2021-01/products/${id}.json`
    return await this.cachedGet<ShopifyProduct>(url, data =>
      stringiyfIdForShopifyProduct(data.product)
    )
  }

  async getCollection(id: string) {
    const url = `/admin/api/2021-01/collections/${id}.json`
    try {
      let results: any = await this.cachedGet<ShopifyCollection>(url, data =>
        stringiyfIdForShopifyCollection(data.collection)
      )
      return results
    } catch (error: any) {
      if (error && error.response.status == 404) {
        console.log('404 not found')
        return { data: {}, header: {} }
      }
    }
  }

  async getCustomCollection(id: string) {
    const url = `/admin/api/2021-01/custom_collections/${id}.json`
    return await this.cachedGet<ShopifyCollection>(url, data =>
      stringiyfIdForShopifyCollection(data.collection)
    )
  }

  async getThemes() {
    const url = '/admin/api/2021-01/themes.json'
    return await this.cachedGet<ShopifyTheme[]>(url, data => data.themes)
  }

  async getLayoutAsset(themeId: string) {
    const url = `/admin/api/2021-01/themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`
    return await this.cachedGet<ShopifyAsset>(url, data => data.asset)
  }

  async updateLayoutAsset(themeId: string, value: string) {
    const url = `/admin/api/2021-01/themes/${themeId}/assets.json`
    return await this.axios.put(url, {
      asset: {
        key: 'layout/theme.liquid',
        value
      }
    })
  }

  async getCartScript() {
    const scriptURL = `${process.env.PROMO_API_HOST}/cart_script.js`
    const url = `/admin/api/2021-01/script_tags.json?src=${scriptURL}`
    return await this.axios.get(url)
  }

  async createCartScript() {
    const scriptURL = `${process.env.PROMO_API_HOST}/cart_script.js`
    const url = '/admin/api/2021-01/script_tags.json'
    return await this.axios.post(url, {
      script_tag: {
        event: 'onload',
        src: scriptURL
      }
    })
  }

  async createDraftOrder(body: CreateDraftOrderBody) {
    const response = await this.axios.post(
      '/admin/api/2021-01/draft_orders.json',
      body
    )
    return response.data
  }

  async getWebhooks() {
    const url = '/admin/api/2021-01/webhooks.json'
    return await this.axios.get(url)
  }

  async createWebhook(body: any) {
    const url = '/admin/api/2021-01/webhooks.json'
    return await this.axios.post(url, body)
  }

  async getCharge(id: string) {
    const url = `/admin/api/2021-04/recurring_application_charges/${id}.json`
    return await this.cachedGet<ShopifyRecurringApplicationCharge>(url, data =>
      stringiyfIdForRecurringApplicationCharge(
        data.recurring_application_charge
      )
    )
  }

  async createCharge(body: any) {
    const url = '/admin/api/2021-04/recurring_application_charges.json'
    return await this.axios.post(url, body)
  }

  async getShop() {
    const url = `/admin/api/2021-04/shop.json`
    return await this.axios.get(url).then(response => response.data.shop)
  }

  async query(query: string, variables?: any) {
    const url = '/admin/api/2021-04/graphql.json'
    return await this.axios.post(url, { query, variables })
  }

  static async createAccessToken(shop: string, code: string) {
    // POST https://{shop}.myshopify.com/admin/oauth/access_token
    // with client_id, client_secret, code to get the access token
    const body = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_SECRET,
      code
    }
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      body
    )
    return response.data.access_token
  }
}
