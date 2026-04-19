import { create } from 'zustand'

interface User {
  id: string
  nickname: string
  profileImageUrl?: string
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user) => {
    localStorage.setItem('onmoment_user', JSON.stringify(user))
    set({ isLoggedIn: true, user })
  },
  logout: () => {
    localStorage.removeItem('onmoment_user')
    set({ isLoggedIn: false, user: null })
  },
  loadFromStorage: () => {
    const raw = localStorage.getItem('onmoment_user')
    if (raw) {
      try {
        const user = JSON.parse(raw) as User
        set({ isLoggedIn: true, user })
      } catch {
        localStorage.removeItem('onmoment_user')
      }
    }
  },
}))
