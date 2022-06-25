import { Column, Entity, getRepository, PrimaryColumn, UpdateDateColumn } from 'typeorm'

import { ShopifyVariant } from '../lib/Shopify'

@Entity('shopifyVariantCache')
export default class ShopifyVariantCache {
  @PrimaryColumn('bigint') id!: string
  @Column('bigint') productId!: string
  @Column('jsonb') data!: ShopifyVariant
  @UpdateDateColumn() updatedAt!: Date

  static async put (variant: ShopifyVariant) {
    const cache = new ShopifyVariantCache()
    cache.id = String(variant.id)
    cache.data = variant
    await getRepository(ShopifyVariantCache)
      .createQueryBuilder()
      .insert()
      .values({ id: String(variant.id), productId: String(variant.product_id), data: variant })
      .onConflict(`("id") DO UPDATE SET "data" = :data, "updatedAt" = NOW()`)
      .setParameter('data', variant)
      .execute()
  }
}
