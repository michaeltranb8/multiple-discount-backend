import './config/env'

import { createConnection } from 'typeorm'

import app from './src/application'

const PORT = process.env.PORT || 3000

createConnection().then(connection => {
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
    console.log('TypeORM Database URL:', process.env.TYPEORM_URL)
  })
})
