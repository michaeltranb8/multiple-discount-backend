import '../support/setup'

import { encodeJWT, decodeJWT } from '../../src/lib/jwt'

test('jwt', () => {
  const data = 'data'
  expect(decodeJWT(encodeJWT(data))).toEqual(data)
})
