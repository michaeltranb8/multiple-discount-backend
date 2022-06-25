import {
  Column,
  Entity,
  getRepository,
  In,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'

import { ShopifyProduct } from '../lib/Shopify'
import ShopifyVariantCache from './ShopifyVariantCache'

@Entity('shopifyProductCache')
export default class ShopifyProductCache {
  @PrimaryColumn('bigint') id!: string
  @Column('jsonb') data!: ShopifyProduct
  @Column('bigint', { array: true }) variantIds!: string[]
  @UpdateDateColumn() updatedAt!: Date

  static async put(product: ShopifyProduct) {
    const cache = new ShopifyProductCache()
    cache.id = String(product.id)
    cache.data = product
    const variantIds = product.variants.map(variant => variant.id)
    await getRepository(ShopifyProductCache)
      .createQueryBuilder()
      .insert()
      .values({
        id: String(product.id),
        data: product,
        variantIds
      })
      .onConflict(
        `("id") DO UPDATE SET "data" = :data, "variantIds" = :variantIds, "updatedAt" = NOW()`
      )
      .setParameter('data', product)
      .setParameter('variantIds', variantIds)
      .execute()

    for (const variant of product.variants) {
      await ShopifyVariantCache.put(variant)
    }
  }

  static async purge(product: ShopifyProduct) {
    const variantIds = product.variants.map(variant => String(variant.id))
    await getRepository(ShopifyVariantCache).delete({ id: In(variantIds) })
    await getRepository(ShopifyProductCache).delete({ id: String(product.id) })
  }
}
