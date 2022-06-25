import { getRepository } from 'typeorm'

import Store from '../entities/Store'

export default async function findOrCreateStore(shop: string) {
  const storeRepo = getRepository(Store)
  const store = await storeRepo.findOne({ where: { shop } })

  if (store) {
    return store
  } else {
    const store = new Store()
    store.shop = shop
    return await storeRepo.save(store)
  }
}
