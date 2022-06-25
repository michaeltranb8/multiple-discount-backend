import {
  Column,
  Entity,
  getRepository,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'

import { ShopifyCollection } from '../lib/Shopify'

@Entity('shopifyCollectionCache')
export default class ShopifyCollectionCache {
  @PrimaryColumn('bigint') id!: string
  @Column('jsonb') data!: ShopifyCollection
  @Column('bigint', { array: true }) productIds!: string[]
  @UpdateDateColumn() updatedAt!: Date

  static async put(collection: ShopifyCollection, productIds: string[] = []) {
    await getRepository(ShopifyCollectionCache)
      .createQueryBuilder()
      .insert()
      .values({
        id: String(collection.id),
        data: collection,
        productIds
      })
      .onConflict(
        `("id") DO UPDATE SET "data" = :data, "productIds" = :productIds, "updatedAt" = NOW()`
      )
      .setParameter('data', collection)
      .setParameter('productIds', productIds)
      .execute()
  }

  static async append(collection: ShopifyCollection, productIds: string[]) {
    const repo = getRepository(ShopifyCollectionCache)
    const cache = await repo.findOne(collection.id)
    if (cache) {
      cache.productIds = [...cache.productIds, ...productIds]
      await repo.save(cache)
    } else {
      throw new Error(
        `Unable to append product ids to collection ${collection.id}.`
      )
    }
  }

  static async purge(collection: ShopifyCollection) {
    await getRepository(ShopifyCollectionCache).delete({
      id: String(collection.id)
    })
  }
}
