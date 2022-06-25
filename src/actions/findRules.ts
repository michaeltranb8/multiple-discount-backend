import { getRepository, ILike } from 'typeorm'

import Rule from '../entities/Rule'
import Store from '../entities/Store'

type SortColumn = 'name' | 'status' | 'priority' | 'startAt' | 'applyAmount'
type SortOrder = 'ASC' | 'DESC'
interface Pagination {
  page: number
  pagesCount: number
}

const PER_PAGE = 5

function sanitizeSortColumn(value: string): SortColumn {
  switch (value) {
    case 'name': return 'name'
    case 'active': return 'status'
    case 'startAt': return 'startAt'
    case 'applyAmount': return 'applyAmount'
    default: return 'priority'
  }
}

function sanitizeSortOrder(value: string): SortOrder {
  if (value.toUpperCase() === 'ASC') {
    return 'ASC'
  }
  return 'DESC'
}

export default async function findRules(
  store: Store,
  keyword: string,
  sortColumn: string = 'updatedAt',
  sortOrder: string = 'DESC',
  page: number = 1
): Promise<[Rule[], Pagination]> {
  const ruleRepo = getRepository(Rule)

  const where = keyword ? { store, name: ILike(`%${keyword}%`) } : { store }

  const rules = await ruleRepo.find({
    where,
    order: {
      [sanitizeSortColumn(sortColumn)]: sanitizeSortOrder(sortOrder)
    },
    take: PER_PAGE,
    skip: (page - 1) * PER_PAGE
  })
  const count = await ruleRepo.count({ where })
  const pagesCount = Math.ceil(count / PER_PAGE)

  return [rules, { page, pagesCount }]
}
