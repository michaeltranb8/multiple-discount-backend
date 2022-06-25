import '../../config/env'

import repl from 'repl'
import { createConnection } from 'typeorm'

createConnection().then(() => {
  repl.start({
    prompt: 'Promotion App Console > '
  })
})
