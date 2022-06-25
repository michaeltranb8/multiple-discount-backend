// ref: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/env.js

import * as dotenv from 'dotenv'
import fs from 'fs'

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  )
}

const dotenvFiles = [
  `.env.${NODE_ENV}.local`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== 'test' && '.env.local',
  `.env.${NODE_ENV}`,
  '.env'
]

dotenvFiles.forEach(dotenvFile => {
  if (dotenvFile && fs.existsSync(dotenvFile)) {
    dotenv.config({ path: dotenvFile })
  }
})
