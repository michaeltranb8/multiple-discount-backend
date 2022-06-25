import '../../config/env'

import { createConnection, getRepository } from 'typeorm'
import ShopifyVariantCache from '../entities/ShopifyVariantCache'
import ShopifyCollectionCache from '../entities/ShopifyCollectionCache'
import ShopifyProductCache from '../entities/ShopifyProductCache'

createConnection().then(async () => {
  await getRepository(ShopifyCollectionCache).delete({})
  await getRepository(ShopifyProductCache).delete({})
  await getRepository(ShopifyVariantCache).delete({})
})
