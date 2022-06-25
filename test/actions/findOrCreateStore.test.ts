import '../support/setup'

import findOrCreateStore from '../../src/actions/findOrCreateStore'
import { getRepository } from 'typeorm'
import Store from '../../src/entities/Store'

const shop = 'test.myshopify.com'

describe('findOrCreateStore', () => {
  test('creates store with domain', async () => {
    const store = await findOrCreateStore(shop)
    expect(store.id).not.toBeUndefined()
  })

  test('does not create duplicated store with the same domain', async () => {
    const createdStore = await findOrCreateStore(shop)
    const store = await findOrCreateStore(shop)
    expect(await getRepository(Store).count()).toEqual(1)
    expect(store.id).toEqual(createdStore.id)
  })
})
