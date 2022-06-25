import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { getRepository } from 'typeorm'
import bodyParser from 'body-parser'

import createOrUpdateRule from '../actions/createOrUpdateRule'
import Rule from '../entities/Rule'
import { getStoreWithAccessToken } from '../lib/accessToken'
import findRules from '../actions/findRules'

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const { keyword, sortColumn, sortOrder, page } = req.query
  const [rules, pagination] = await findRules(
    store,
    keyword as string,
    sortColumn as string,
    sortOrder as string,
    parseInt(page as string) || 1
  )

  res.json({ rules: rules.map(rule => rule.asJSON()), pagination })
}))

router.post('/', bodyParser.json(), asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const rule = new Rule()
  rule.store = store
  const createdRule = await createOrUpdateRule(rule, req.body)

  res.json({ rule: createdRule.asJSON() })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const foundRule = await getRepository(Rule).findOne({ where: { store, id: req.params.id } })

  if (foundRule) {
    res.json({ rule: foundRule.asJSON() })
  } else {
    res.status(404).json({ error: 'rule not found' })
  }
}))

router.patch('/:id', bodyParser.json(), asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const foundRule = await getRepository(Rule).findOne({ where: { store, id: req.params.id } })
  if (!foundRule) {
    return res.status(404).json({ error: 'rule not found' })
  }
  const rule = await createOrUpdateRule(foundRule, req.body)

  res.json({ rule: rule.asJSON() })
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  const store = await getStoreWithAccessToken(req)
  const foundRule = await getRepository(Rule).findOne({ where: { store, id: req.params.id } })
  if (!foundRule) {
    return res.status(404).json({ error: 'rule not found' })
  }
  await getRepository(Rule).delete(req.params.id)

  res.json({ rule: foundRule.asJSON() })
}))

export default router
