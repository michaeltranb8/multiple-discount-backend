import {
  Column, CreateDateColumn, Entity, FindOneOptions, getRepository, OneToMany, OneToOne, PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { decodeJWT, encodeJWT } from '../lib/jwt'
import Shopify from '../lib/Shopify'
import Rule from './Rule'
import ShopifyCache from '../lib/ShopifyCache'

type SubscriptionState = undefined | 'pending' | 'subscribed'

@Entity('stores')
export default class Store {
  @PrimaryGeneratedColumn() id!: number
  @Column('varchar') shop!: string
  @Column('varchar', { nullable: true }) shopifyAccessToken!: string
  @Column('varchar', { nullable: true }) subscriptionState!: SubscriptionState
  @Column('bigint', { nullable: true }) chargeId!: string | undefined
  @CreateDateColumn() createdAt!: Date
  @UpdateDateColumn() updatedAt!: Date

  _shopify: Shopify | undefined
  _cache: ShopifyCache | undefined

  @OneToMany(() => Rule, rule => rule.store, { onDelete: 'CASCADE' })
  rules!: Rule[]

  generateAccessToken () {
    return encodeJWT({ id: this.id }, {
      expiresIn: '7 days',
    })
  }

  static async verifyAccessToken (accessToken: string, options?: FindOneOptions<Store>) {
    try {
      const decoded = decodeJWT(accessToken) as { id: number }
      return getRepository(Store).findOne(decoded.id, options)
    } catch (error) {
      // just return undefined with any invalid access token
    }
  }

  get shopify () {
    if (!this._shopify) {
      this._shopify = Shopify.fromStore(this)
    }
    return this._shopify
  }

  get cache () {
    if (!this._cache) {
      this._cache = new ShopifyCache(this.shopify)
    }
    return this._cache
  }
}
