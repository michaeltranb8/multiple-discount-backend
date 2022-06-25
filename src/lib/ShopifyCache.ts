import { getRepository, In, Raw } from 'typeorm'
import parseLinkHeader from 'parse-link-header'

import Shopify, {
  ShopifyCollection,
  ShopifyProduct,
  ShopifyVariant
} from './Shopify'
import ShopifyProductCache from '../entities/ShopifyProductCache'
import ShopifyVariantCache from '../entities/ShopifyVariantCache'
import ShopifyCollectionCache from '../entities/ShopifyCollectionCache'

export default class ShopifyCache {
  shopify: Shopify
  collections: Record<string, ShopifyCollectionCache>
  products: Record<string, ShopifyProduct>
  productVariants: Record<string, ShopifyVariant>
  cachedCollectionIds: string[]
  cachedProductIds: string[]
  cachedVariantIds: string[]
  uncachedCollectionIds: string[]
  uncachedProductIds: string[]
  uncachedVariantIds: string[]

  constructor(shopify: Shopify) {
    this.shopify = shopify
    this.collections = {}
    this.products = {}
    this.productVariants = {}
    this.cachedCollectionIds = []
    this.cachedProductIds = []
    this.cachedVariantIds = []
    this.uncachedCollectionIds = []
    this.uncachedProductIds = []
    this.uncachedVariantIds = []
  }

  addProductVariant(input: number | string) {
    const id = String(input)
    console.info('[Cache] Adding product variant id:', id)
    if (this.productVariants[id] || this.uncachedVariantIds.includes(id)) {
      return
    }
    this.uncachedVariantIds.push(id)
  }

  addProduct(input: number | string) {
    const id = String(input)
    console.info('[Cache] Adding product id:', id)
    if (this.products[id] || this.uncachedProductIds.includes(id)) {
      return
    }
    this.uncachedProductIds.push(id)
  }

  addCollection(input: number | string) {
    const id = String(input)
    console.info('[Cache] Adding collection id:', id)
    if (this.collections[id] || this.uncachedCollectionIds.includes(id)) {
      return
    }
    this.uncachedCollectionIds.push(id)
  }

  async load() {
    const startTime = Date.now()
    console.info('[Cache] Load start.')
    await this.loadCollections()
    await this.loadProducts()
    await this.loadProductVariants()
    console.info('[Cache] Load finish, costs', Date.now() - startTime, 'ms.')
  }

  private async loadCollections() {
    const collectionCache = await getRepository(ShopifyCollectionCache).find({
      where: {
        id: In(this.uncachedCollectionIds),
        updatedAt: Raw(alias => `${alias} >= NOW() - INTERVAL '1 day'`)
      }
    })
    console.info(
      '[Cache] Load collections from db:',
      this.uncachedCollectionIds
    )
    // store as a map
    collectionCache.forEach(cache => {
      this.collections[cache.id] = cache
      // add product ids from collection
      cache.productIds.forEach(id => this.addProduct(id))
    })
    // fetch if there were any ids that not be cached
    for (const id of this.uncachedCollectionIds) {
      // this may not good since user can make an empty collection
      if (this.collections[id] && this.collections[id].productIds.length > 0) {
        continue
      }
      const { data } = await this.shopify.getCollection(id)
      console.info('[Cache] Fetch collection id from shopify:', id)
      if (Object.keys(data).length === 0) {
        return
      }
      await ShopifyCollectionCache.put(data)
      const cache = await getRepository(ShopifyCollectionCache).findOne(id)
      if (cache) {
        this.collections[id] = cache
      }
      // prevent smart collection loads products
      if (data.collection_type === 'smart') {
        console.info('[Cache] Skip fetch smart collection products:', id)
      } else {
        this.loadCustomCollectionProducts(data)
      }
    }
    // remove uncached ids
    this.uncachedCollectionIds = []
  }

  private async loadCustomCollectionProducts(data: ShopifyCollection) {
    // handle pagination
    let link:
      | string
      | null = `/admin/api/2021-01/collections/${data.id}/products.json?limit=250`
    while (link) {
      const { data: products, headers } =
        await this.shopify.getCollectionProductsByLink(link)
      const productIds = products.map(product => product.id)
      await ShopifyCollectionCache.append(data, productIds)
      productIds.forEach(id => this.addProduct(id))
      const links = parseLinkHeader(headers.link)
      if (links && links.next) {
        link = links.next.url
      } else {
        link = null
      }
    }
    console.info('[Cache] Fetch collection from shopify:', data.id)
  }

  private async loadProducts() {
    // load cached data from db
    const productCache = await getRepository(ShopifyProductCache).find({
      where: {
        id: In(this.uncachedProductIds),
        updatedAt: Raw(alias => `${alias} >= NOW() - INTERVAL '1 day'`)
      }
    })
    console.info('[Cache] Load product from db:', this.uncachedProductIds)
    // store as a map
    productCache.forEach(cache => {
      this.products[cache.id] = cache.data
      // add product variant ids from product
      cache.variantIds.forEach(id => this.addProductVariant(id))
    })
    // fetch if there were any ids that not be cached
    for (const id of this.uncachedProductIds) {
      if (this.products[id]) {
        continue
      }
      const { data } = await this.shopify.getProduct(id)
      console.info('[Cache] Fetch product from shopify:', id)
      data.variants.forEach(variant => {
        this.productVariants[variant.id] = variant
      })
      this.products[id] = data
      await ShopifyProductCache.put(data)
    }
    // remove uncached ids
    this.uncachedProductIds = []
  }

  private async loadProductVariants() {
    // load cached data from db
    const variantCache = await getRepository(ShopifyVariantCache).find({
      where: {
        id: In(this.uncachedVariantIds),
        updatedAt: Raw(alias => `${alias} >= NOW() - INTERVAL '1 day'`)
      }
    })
    console.info(
      '[Cache] Load product variants from db:',
      this.uncachedVariantIds
    )
    // store as a map
    variantCache.forEach(cache => {
      this.productVariants[cache.id] = cache.data
    })
    // fetch if there were any ids that not be cached
    for (const id of this.uncachedVariantIds) {
      if (this.productVariants[id]) {
        continue
      }
      const { data } = await this.shopify.getVariant(id)
      console.info('[Cache] Fetch product variant from shopify:', id, data)
      if (Object.keys(data).length === 0) {
        return
      }
      this.productVariants[id] = data
      await ShopifyVariantCache.put(data)
    }
    // remove uncached ids
    this.uncachedVariantIds = []
  }
}
