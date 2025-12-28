import 'reflect-metadata'
import { Hono } from 'hono'
import { AppDataSource } from '../database'
import { User } from '../entities/User'

// 确保实体类被加载
void User

const usersRoute = new Hono()

// 获取所有用户
usersRoute.get('/', async c => {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const users = await userRepository.find({
      relations: ['posts'],
    })
    return c.json({ code: 200, data: users, message: 'Success' })
  } catch (error) {
    console.error('Get users error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 根据 ID 获取用户
usersRoute.get('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'))
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: { id },
      relations: ['posts'],
    })
    if (!user) {
      return c.json({ code: 404, message: 'User not found' }, 404)
    }
    return c.json({ code: 200, data: user, message: 'Success' })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 创建用户
usersRoute.post('/', async c => {
  try {
    const body = await c.req.json()
    const { name, email, avatar } = body

    if (!name || !email) {
      return c.json({ code: 400, message: 'Name and email are required' }, 400)
    }

    const userRepository = AppDataSource.getRepository(User)
    const user = userRepository.create({
      name,
      email,
      avatar: avatar || null,
    })
    const savedUser = await userRepository.save(user)
    return c.json({ code: 200, data: savedUser, message: 'User created successfully' })
  } catch (error) {
    console.error('Create user error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 更新用户
usersRoute.put('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { name, email, avatar } = body

    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })
    if (!user) {
      return c.json({ code: 404, message: 'User not found' }, 404)
    }

    if (name) user.name = name
    if (email) user.email = email
    if (avatar !== undefined) user.avatar = avatar

    const updatedUser = await userRepository.save(user)
    return c.json({ code: 200, data: updatedUser, message: 'User updated successfully' })
  } catch (error) {
    console.error('Update user error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 删除用户
usersRoute.delete('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'))
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })
    if (!user) {
      return c.json({ code: 404, message: 'User not found' }, 404)
    }

    await userRepository.remove(user)
    return c.json({ code: 200, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

export default usersRoute
