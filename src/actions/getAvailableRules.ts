import { getRepository, Raw } from 'typeorm'

import Rule from '../entities/Rule'
import Store from '../entities/Store'

export default async function getAvailableRules(store: Store) {
  return await getRepository(Rule).find({
    where: {
      store,
      status: true,
      startAt: Raw(alias => `(${alias} IS NULL OR ${alias} <= NOW())`),
      endAt: Raw(alias => `(${alias} IS NULL OR ${alias} >= NOW())`)
    },
    order: {
      priority: 'DESC'
    }
  })
}
