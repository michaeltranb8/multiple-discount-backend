import '../support/setup'

import { generateHMAC } from '../../src/lib/hmac'

test('generateHMAC', () => {
  const input = 'code=bb182e4492b0747f2cbe36ba6cb73273&shop=kef-staging-hk.myshopify.com&state=fc88fa46-73c7-4afc-b61c-a972310a1ab7&timestamp=1611660640'
  const output = 'cda676af1cf7f64b0c31d5311e5496bc1a9e1f6c24db022a412aae4e4ed6e063'
  expect(generateHMAC(input)).toEqual(output)
})
