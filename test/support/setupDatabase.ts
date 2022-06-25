import { createConnection, getConnection } from 'typeorm'

beforeAll(async () => {
  await createConnection()
})

afterAll(async () => {
  try {
    await getConnection().close()
  } catch (error) {
    console.warn(error)
  }
})

afterEach(async () => {
  const connection = getConnection()
  const entities = connection.entityMetadatas

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name)
    await repository.delete({})
  }
})
