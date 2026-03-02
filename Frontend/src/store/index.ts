import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  rightPanelOpen: boolean
  selectedCompanyId: string | null
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  toggleRightPanel: () => void
  setSelectedCompanyId: (id: string | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

// Get initial theme from localStorage or system preference
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark'
  
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (stored) return stored
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  rightPanelOpen: false,
  selectedCompanyId: null,
  theme: getInitialTheme(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    set({ theme: newTheme })
  },
}))

interface FilterState {
  search: string
  industry: string
  intentScore: string
  channel: string
  setSearch: (search: string) => void
  setIndustry: (industry: string) => void
  setIntentScore: (score: string) => void
  setChannel: (channel: string) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  search: '',
  industry: '',
  intentScore: '',
  channel: '',
  setSearch: (search) => set({ search }),
  setIndustry: (industry) => set({ industry }),
  setIntentScore: (intentScore) => set({ intentScore }),
  setChannel: (channel) => set({ channel }),
  resetFilters: () => set({ search: '', industry: '', intentScore: '', channel: '' }),
}))
