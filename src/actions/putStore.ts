import { getRepository } from 'typeorm'

import Store from '../entities/Store'
import findOrCreateStore from './findOrCreateStore'

interface PutStoreProps {
  shop: string
  shopifyAccessToken: string
}

export default async function putStore({ shop, shopifyAccessToken }: PutStoreProps) {
  const store = await findOrCreateStore(shop)
  store.shopifyAccessToken = shopifyAccessToken
  return await getRepository(Store).save(store)
}
