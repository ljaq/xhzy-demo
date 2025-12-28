import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import UserProvider from 'client/contexts/useUser'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { UserStoreContext, PostStoreContext, userStore, postStore } from 'client/stores'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <UserProvider>
        <UserStoreContext.Provider value={userStore}>
          <PostStoreContext.Provider value={postStore}>
            <App />
          </PostStoreContext.Provider>
        </UserStoreContext.Provider>
      </UserProvider>
    </BrowserRouter>
    <ReactQueryDevtools />
  </QueryClientProvider>,
)
