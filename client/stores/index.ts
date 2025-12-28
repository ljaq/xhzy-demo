import { createContext, useContext } from 'react'
import { UserStore, UserStoreType } from './UserStore'
import { PostStore, PostStoreType } from './PostStore'

// 创建 store 实例
export const userStore = UserStore.create({
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
})

export const postStore = PostStore.create({
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,
})

// 创建 Context
export const UserStoreContext = createContext<UserStoreType | null>(null)
export const PostStoreContext = createContext<PostStoreType | null>(null)

// 创建 Hooks
export const useUserStore = () => {
  const store = useContext(UserStoreContext)
  if (!store) {
    throw new Error('useUserStore must be used within UserStoreProvider')
  }
  return store
}

export const usePostStore = () => {
  const store = useContext(PostStoreContext)
  if (!store) {
    throw new Error('usePostStore must be used within PostStoreProvider')
  }
  return store
}

