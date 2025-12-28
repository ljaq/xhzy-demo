import { types, flow, Instance } from 'mobx-state-tree'
import { request } from '../api'
import { PostModel } from './UserStore'

// PostStore
export const PostStore = types
  .model('PostStore', {
    posts: types.array(PostModel),
    selectedPost: types.maybeNull(types.reference(PostModel)),
    loading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .views(self => ({
    // 计算值：文章总数
    get totalPosts() {
      return self.posts.length
    },
    // 计算值：是否有选中的文章
    get hasSelectedPost() {
      return !!self.selectedPost
    },
    // 计算值：按作者分组的文章数
    get postsByAuthor() {
      const grouped: Record<number, number> = {}
      self.posts.forEach(post => {
        grouped[post.authorId] = (grouped[post.authorId] || 0) + 1
      })
      return grouped
    },
    // 计算值：最新的文章
    get latestPost() {
      if (self.posts.length === 0) return null
      return self.posts.reduce((latest, post) => {
        return new Date(post.createdAt) > new Date(latest.createdAt) ? post : latest
      })
    },
  }))
  .actions(self => ({
    // 同步 action：设置选中的文章
    setSelectedPost(postId: number | null) {
      if (postId === null) {
        self.selectedPost = null
        return
      }
      const post = self.posts.find(p => p.id === postId)
      if (post) {
        self.selectedPost = post
      }
    },
    // 同步 action：清除错误
    clearError() {
      self.error = null
    },
    // 同步 action：添加文章到列表
    addPost(post: Instance<typeof PostModel>) {
      const existingIndex = self.posts.findIndex(p => p.id === post.id)
      if (existingIndex >= 0) {
        self.posts[existingIndex] = post
      } else {
        self.posts.push(post)
      }
    },
    // 同步 action：更新文章
    updatePost(postId: number, updates: Partial<Instance<typeof PostModel>>) {
      const post = self.posts.find(p => p.id === postId)
      if (post) {
        Object.assign(post, updates)
      }
    },
    // 同步 action：删除文章
    removePost(postId: number) {
      const index = self.posts.findIndex(p => p.id === postId)
      if (index >= 0) {
        self.posts.splice(index, 1)
        if (self.selectedPost?.id === postId) {
          self.selectedPost = null
        }
      }
    },
  }))
  .actions(self => ({
    // 异步 action：获取所有文章
    fetchPosts: flow(function* () {
      self.loading = true
      self.error = null
      try {
        const response = yield request.posts.get()
        if (response.code === 200) {
          self.posts = response.data
        } else {
          self.error = response.message || '获取文章列表失败'
        }
      } catch (error: any) {
        self.error = error.message || '获取文章列表失败'
        console.error('Fetch posts error:', error)
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：获取单个文章
    fetchPost: flow(function* (id: number) {
      self.loading = true
      self.error = null
      try {
        const response = yield request.posts.params({ id }).get()
        if (response.code === 200) {
          self.addPost(response.data)
          self.setSelectedPost(id)
        } else {
          self.error = response.message || '获取文章失败'
        }
      } catch (error: any) {
        self.error = error.message || '获取文章失败'
        console.error('Fetch post error:', error)
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：创建文章
    createPost: flow(function* (postData: { title: string; content: string; authorId: number }) {
      self.loading = true
      self.error = null
      try {
        const response = yield (request.posts as any).body(postData).post()
        if (response.code === 200) {
          self.addPost(response.data)
          return response.data
        } else {
          self.error = response.message || '创建文章失败'
          throw new Error(response.message || '创建文章失败')
        }
      } catch (error: any) {
        self.error = error.message || '创建文章失败'
        console.error('Create post error:', error)
        throw error
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：更新文章
    updatePostById: flow(function* (id: number, postData: { title?: string; content?: string }) {
      self.loading = true
      self.error = null
      try {
        const response = yield (request.posts as any).params({ id }).body(postData).put()
        if (response.code === 200) {
          self.updatePost(id, response.data)
          return response.data
        } else {
          self.error = response.message || '更新文章失败'
          throw new Error(response.message || '更新文章失败')
        }
      } catch (error: any) {
        self.error = error.message || '更新文章失败'
        console.error('Update post error:', error)
        throw error
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：删除文章
    deletePost: flow(function* (id: number) {
      self.loading = true
      self.error = null
      try {
        const response = yield request.posts.params({ id }).delete()
        if (response.code === 200) {
          self.removePost(id)
        } else {
          self.error = response.message || '删除文章失败'
          throw new Error(response.message || '删除文章失败')
        }
      } catch (error: any) {
        self.error = error.message || '删除文章失败'
        console.error('Delete post error:', error)
        throw error
      } finally {
        self.loading = false
      }
    }),
  }))

export type PostStoreType = Instance<typeof PostStore>

