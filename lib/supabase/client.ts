import { createBrowserClient } from '@supabase/ssr'
import { isDev } from '@/lib/isDev'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the SSR-compatible client for browser usage
export const createClient = () => {
  // In dev mode, return a mock client if Supabase is not available
  if (isDev) {
    return {
      auth: {
        getUser: async () => ({ 
          data: { 
            user: { 
              id: 'dev-user-123', 
              email: 'dev@local.test',
              user_metadata: {
                name: 'Dev User',
                avatar: null
              }
            } 
          }, 
          error: null 
        }),
        signInWithPassword: async () => ({ 
          data: { 
            user: { 
              id: 'dev-user-123', 
              email: 'dev@local.test',
              user_metadata: {
                name: 'Dev User',
                avatar: null
              }
            } 
          }, 
          error: null 
        }),
        signOut: async () => ({ error: null }),
      },
      storage: {
        from: () => ({
          upload: async (path: string, file: File, options?: any) => ({ 
            data: { path: `dev-user-123/${path}` }, 
            error: null 
          }),
          getPublicUrl: (path: string) => ({ 
            data: { publicUrl: `http://localhost:3000/${path}` } 
          }),
        }),
      },
    }
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Export a default client instance for direct usage
export const supabase = isDev ? {
  auth: {
    getUser: async () => ({ 
      data: { 
        user: { 
          id: 'dev-user-123', 
          email: 'dev@local.test',
          user_metadata: {
            name: 'Dev User',
            avatar: null
          }
        } 
      }, 
      error: null 
    }),
    signInWithPassword: async () => ({ 
      data: { 
        user: { 
          id: 'dev-user-123', 
          email: 'dev@local.test',
          user_metadata: {
            name: 'Dev User',
            avatar: null
          }
        } 
      }, 
      error: null 
    }),
    signOut: async () => ({ error: null }),
  },
  storage: {
    from: () => ({
      upload: async (path: string, file: File, options?: any) => ({ 
        data: { path: `dev-user-123/${path}` }, 
        error: null 
      }),
      getPublicUrl: (path: string) => ({ 
        data: { publicUrl: `http://localhost:3000/${path}` } 
      }),
    }),
  },
} : createBrowserClient(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  if (isDev) {
    return { 
      id: 'dev-user-123', 
      email: 'dev@local.test', 
      role: 'developer',
      user_metadata: {
        name: 'Dev User',
        avatar: null
      }
    }
  }

  const { data } = await supabase.auth.getUser()
  return data.user
}
