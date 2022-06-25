import '../support/setup'

import findOrCreateStore from '../../src/actions/findOrCreateStore'
import { getRepository } from 'typeorm'
import Store from '../../src/entities/Store'
import getAvailableRules from '../../src/actions/getAvailableRules'
import Rule from '../../src/entities/Rule'
import Big from 'big.js'
import { getTomorrow, getYesterday } from '../support/dateHelper'

const shop = 'test.myshopify.com'

async function createRule(store: Store, values: object) {
  const rule = new Rule()
  rule.store = store
  rule.customerGroups = []
  rule.applyAmount = new Big(0)
  Object.assign(rule, values)
  return await getRepository(Rule).save(rule)
}

describe('getAvailableRules', () => {
  test('not returns rules that not belongs to store', async () => {
    const anotherShop = 'test2.myshopify.com'
    const anotherStore = await findOrCreateStore(anotherShop)
    const store = await findOrCreateStore(shop)
    await createRule(anotherStore, { status: true })
    const rules = await getAvailableRules(store)
    expect(rules.length).toEqual(0)
  })

  test('returns rules that belongs to store', async () => {
    const store = await findOrCreateStore(shop)
    await createRule(store, { status: true, startAt: null, endAt: null })
    const rules = await getAvailableRules(store)
    expect(rules.length).toEqual(1)
  })

  test('not returns rules that was not started yet', async () => {
    const store = await findOrCreateStore(shop)
    await createRule(store, { status: true, startAt: getTomorrow(), endAt: null })
    const rules = await getAvailableRules(store)
    expect(rules.length).toEqual(0)
  })

  test('returns rules that was started', async () => {
    const store = await findOrCreateStore(shop)
    await createRule(store, { status: true, startAt: getYesterday(), endAt: null })
    const rules = await getAvailableRules(store)
    expect(rules.length).toEqual(1)
  })

  test('returns rules that was not ended yet', async () => {
    const store = await findOrCreateStore(shop)
    await createRule(store, { status: true, startAt: null, endAt: getTomorrow() })
    const rules = await getAvailableRules(store)
    expect(rules.length).toEqual(1)
  })

  test('not returns rules that was ended', async () => {
    const store = await findOrCreateStore(shop)
    await createRule(store, { status: true, startAt: null, endAt: getYesterday() })
    const rules = await getAvailableRules(store)
    expect(rules.length).toEqual(0)
  })
})
