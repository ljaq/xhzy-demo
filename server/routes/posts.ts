import 'reflect-metadata'
import { Hono } from 'hono'
import { AppDataSource } from '../database'
import { Post } from '../entities/Post'
import { User } from '../entities/User'

// 确保实体类被加载
void Post
void User

const postsRoute = new Hono()

// 获取所有文章
postsRoute.get('/', async c => {
  try {
    const postRepository = AppDataSource.getRepository(Post)
    const posts = await postRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    })
    return c.json({ code: 200, data: posts, message: 'Success' })
  } catch (error) {
    console.error('Get posts error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 根据 ID 获取文章
postsRoute.get('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'))
    const postRepository = AppDataSource.getRepository(Post)
    const post = await postRepository.findOne({
      where: { id },
      relations: ['author'],
    })
    if (!post) {
      return c.json({ code: 404, message: 'Post not found' }, 404)
    }
    return c.json({ code: 200, data: post, message: 'Success' })
  } catch (error) {
    console.error('Get post error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 创建文章
postsRoute.post('/', async c => {
  try {
    const body = await c.req.json()
    const { title, content, authorId } = body

    if (!title || !content || !authorId) {
      return c.json({ code: 400, message: 'Title, content and authorId are required' }, 400)
    }

    const userRepository = AppDataSource.getRepository(User)
    const author = await userRepository.findOne({ where: { id: authorId } })
    if (!author) {
      return c.json({ code: 404, message: 'Author not found' }, 404)
    }

    const postRepository = AppDataSource.getRepository(Post)
    const post = postRepository.create({
      title,
      content,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const savedPost = await postRepository.save(post)
    const postWithAuthor = await postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['author'],
    })
    return c.json({ code: 200, data: postWithAuthor, message: 'Post created successfully' })
  } catch (error) {
    console.error('Create post error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 更新文章
postsRoute.put('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { title, content } = body

    const postRepository = AppDataSource.getRepository(Post)
    const post = await postRepository.findOne({ where: { id } })
    if (!post) {
      return c.json({ code: 404, message: 'Post not found' }, 404)
    }

    if (title) post.title = title
    if (content) post.content = content
    post.updatedAt = new Date()

    const updatedPost = await postRepository.save(post)
    const postWithAuthor = await postRepository.findOne({
      where: { id: updatedPost.id },
      relations: ['author'],
    })
    return c.json({ code: 200, data: postWithAuthor, message: 'Post updated successfully' })
  } catch (error) {
    console.error('Update post error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

// 删除文章
postsRoute.delete('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'))
    const postRepository = AppDataSource.getRepository(Post)
    const post = await postRepository.findOne({ where: { id } })
    if (!post) {
      return c.json({ code: 404, message: 'Post not found' }, 404)
    }

    await postRepository.remove(post)
    return c.json({ code: 200, message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    return c.json({ code: 500, message: 'Internal server error' }, 500)
  }
})

export default postsRoute

