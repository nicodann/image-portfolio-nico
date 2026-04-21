interface NetlifyIdentityUser {
  id: string
  email: string
  token: {
    access_token: string
    expires_at: number
    refresh_token: string
    token_type: string
  }
}

interface NetlifyIdentityWidget {
  init: (opts?: { APIUrl?: string }) => void
  open: (tab?: 'login' | 'signup') => void
  close: () => void
  currentUser: () => NetlifyIdentityUser | null
  logout: () => void
  on: (
    event: 'init' | 'login' | 'logout' | 'error' | 'open' | 'close',
    cb: (user?: NetlifyIdentityUser) => void
  ) => void
  off: (event: string, cb?: () => void) => void
  refresh: (force?: boolean) => Promise<NetlifyIdentityUser>
}

declare global {
  interface Window {
    netlifyIdentity: NetlifyIdentityWidget
  }
}

export {}
