import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let User: any, Post: any

async function loadEntities() {
  const userModule = await import('./entities/User.ts')
  const postModule = await import('./entities/Post.ts')
  User = userModule.User
  Post = postModule.Post
}

export let AppDataSource: DataSource

export const createDataSource = () => {
  if (!AppDataSource) {
    AppDataSource = new DataSource({
      type: 'better-sqlite3',
      database: join(__dirname, 'database.sqlite'),
      synchronize: true,
      logging: false,
    })
  }
  return AppDataSource
}

export const initializeDatabase = async () => {
  const dataSource = createDataSource()

  if (!dataSource.isInitialized) {
    try {
      await loadEntities()
      ;(AppDataSource.options as any).entities = [User, Post]
      await dataSource.initialize()
      console.log('Database initialized successfully')
      return dataSource
    } catch (error) {
      console.error('Database initialization error:', error)
      throw error
    }
  }
  return dataSource
}
