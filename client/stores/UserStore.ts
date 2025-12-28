import { types, flow, Instance } from 'mobx-state-tree'
import { request } from '../api'

// User 模型
export const UserModel = types
  .model('User', {
    id: types.identifierNumber,
    name: types.string,
    email: types.string,
    avatar: types.maybeNull(types.string),
    posts: types.optional(types.array(types.late(() => PostModel)), []),
  })
  .views(self => ({
    // 计算值：用户显示名称
    get displayName() {
      return self.name || self.email
    },
    // 计算值：用户文章数量
    get postCount() {
      return self.posts.length
    },
    // 计算值：是否有头像
    get hasAvatar() {
      return !!self.avatar
    },
  }))

// Post 模型
export const PostModel = types
  .model('Post', {
    id: types.identifierNumber,
    title: types.string,
    content: types.string,
    authorId: types.number,
    createdAt: types.string,
    updatedAt: types.string,
    author: types.maybeNull(types.late(() => UserModel)),
  })
  .views(self => ({
    // 计算值：文章摘要（前100个字符）
    get excerpt() {
      return self.content.length > 100 ? `${self.content.substring(0, 100)}...` : self.content
    },
    // 计算值：创建时间格式化
    get formattedCreatedAt() {
      return new Date(self.createdAt).toLocaleString('zh-CN')
    },
    // 计算值：作者名称
    get authorName() {
      return self.author?.name || '未知作者'
    },
  }))

// UserStore
export const UserStore = types
  .model('UserStore', {
    users: types.array(UserModel),
    selectedUser: types.maybeNull(types.reference(UserModel)),
    loading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .views(self => ({
    // 计算值：用户总数
    get totalUsers() {
      return self.users.length
    },
    // 计算值：是否有选中的用户
    get hasSelectedUser() {
      return !!self.selectedUser
    },
    // 计算值：所有用户的总文章数
    get totalPosts() {
      return self.users.reduce((sum, user) => sum + user.postCount, 0)
    },
  }))
  .actions(self => ({
    // 同步 action：设置选中的用户
    setSelectedUser(userId: number | null) {
      if (userId === null) {
        self.selectedUser = null
        return
      }
      const user = self.users.find(u => u.id === userId)
      if (user) {
        self.selectedUser = user
      }
    },
    // 同步 action：清除错误
    clearError() {
      self.error = null
    },
    // 同步 action：添加用户到列表（用于优化更新）
    addUser(user: Instance<typeof UserModel>) {
      const existingIndex = self.users.findIndex(u => u.id === user.id)
      if (existingIndex >= 0) {
        self.users[existingIndex] = user
      } else {
        self.users.push(user)
      }
    },
    // 同步 action：更新用户
    updateUser(userId: number, updates: Partial<Instance<typeof UserModel>>) {
      const user = self.users.find(u => u.id === userId)
      if (user) {
        Object.assign(user, updates)
      }
    },
    // 同步 action：删除用户
    removeUser(userId: number) {
      const index = self.users.findIndex(u => u.id === userId)
      if (index >= 0) {
        self.users.splice(index, 1)
        if (self.selectedUser?.id === userId) {
          self.selectedUser = null
        }
      }
    },
  }))
  .actions(self => ({
    // 异步 action：获取所有用户
    fetchUsers: flow(function* () {
      self.loading = true
      self.error = null
      try {
        const response = yield request.users.get()
        if (response.code === 200) {
          self.users = response.data
        } else {
          self.error = response.message || '获取用户列表失败'
        }
      } catch (error: any) {
        self.error = error.message || '获取用户列表失败'
        console.error('Fetch users error:', error)
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：获取单个用户
    fetchUser: flow(function* (id: number) {
      self.loading = true
      self.error = null
      try {
        const response = yield request.users.params({ id }).get()
        if (response.code === 200) {
          self.addUser(response.data)
          self.setSelectedUser(id)
        } else {
          self.error = response.message || '获取用户失败'
        }
      } catch (error: any) {
        self.error = error.message || '获取用户失败'
        console.error('Fetch user error:', error)
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：创建用户
    createUser: flow(function* (userData: { name: string; email: string; avatar?: string }) {
      self.loading = true
      self.error = null
      try {
        const response = yield (request.users as any).body(userData).post()
        if (response.code === 200) {
          self.addUser(response.data)
          return response.data
        } else {
          self.error = response.message || '创建用户失败'
          throw new Error(response.message || '创建用户失败')
        }
      } catch (error: any) {
        self.error = error.message || '创建用户失败'
        console.error('Create user error:', error)
        throw error
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：更新用户
    updateUserById: flow(function* (id: number, userData: { name?: string; email?: string; avatar?: string }) {
      self.loading = true
      self.error = null
      try {
        const response = yield (request.users as any).params({ id }).body(userData).put()
        if (response.code === 200) {
          self.updateUser(id, response.data)
          return response.data
        } else {
          self.error = response.message || '更新用户失败'
          throw new Error(response.message || '更新用户失败')
        }
      } catch (error: any) {
        self.error = error.message || '更新用户失败'
        console.error('Update user error:', error)
        throw error
      } finally {
        self.loading = false
      }
    }),
    // 异步 action：删除用户
    deleteUser: flow(function* (id: number) {
      self.loading = true
      self.error = null
      try {
        const response = yield request.users.params({ id }).delete()
        if (response.code === 200) {
          self.removeUser(id)
        } else {
          self.error = response.message || '删除用户失败'
          throw new Error(response.message || '删除用户失败')
        }
      } catch (error: any) {
        self.error = error.message || '删除用户失败'
        console.error('Delete user error:', error)
        throw error
      } finally {
        self.loading = false
      }
    }),
  }))

export type UserStoreType = Instance<typeof UserStore>
export type UserModelType = Instance<typeof UserModel>
export type PostModelType = Instance<typeof PostModel>
