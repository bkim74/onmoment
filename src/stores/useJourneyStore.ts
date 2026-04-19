import { create } from 'zustand'
import { saveJourney as persistJourney, getJourney, getDailyMeta } from '../services/storage'

function calcCurrentDay(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.min(diffDays + 1, 40)
}

interface JourneyState {
  journeyId: string | null
  startDate: string | null
  status: 'idle' | 'onboarding' | 'active' | 'completed'
  currentDay: number
  hasRecordedToday: boolean
  startOnboarding: () => void
  startJourney: () => void
  markRecorded: () => void
  advanceDay: () => void
  completeJourney: () => void
  loadFromStorage: () => void
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  journeyId: null,
  startDate: null,
  status: 'idle',
  currentDay: 0,
  hasRecordedToday: false,

  startOnboarding: () => {
    const data = {
      journeyId: crypto.randomUUID(),
      startDate: new Date().toISOString(),
      status: 'onboarding' as const,
      currentDay: 0,
    }
    persistJourney(data)
    set({ ...data, hasRecordedToday: false })
  },

  startJourney: () => {
    const { journeyId } = get()
    if (!journeyId) return
    const startDate = new Date().toISOString()
    const data = {
      journeyId,
      startDate,
      status: 'active' as const,
      currentDay: 1,
    }
    persistJourney(data)
    set({ ...data, hasRecordedToday: false })
  },

  markRecorded: () => {
    set({ hasRecordedToday: true })
  },

  advanceDay: () => {
    const { startDate, currentDay, journeyId, status } = get()
    if (!journeyId || !startDate || currentDay >= 40) return
    const next = currentDay + 1
    const data = {
      journeyId,
      startDate,
      status: next > 40 ? ('completed' as const) : status,
      currentDay: next,
    }
    persistJourney(data)
    set({ ...data, hasRecordedToday: false })
  },

  completeJourney: () => {
    const { journeyId, startDate, currentDay } = get()
    if (!journeyId || !startDate) return
    const data = {
      journeyId,
      startDate,
      status: 'completed' as const,
      currentDay,
    }
    persistJourney(data)
    set({ status: 'completed' })
  },

  loadFromStorage: () => {
    const stored = getJourney()
    if (!stored) return

    const currentDay = stored.status === 'active' && stored.startDate
      ? calcCurrentDay(stored.startDate)
      : stored.currentDay

    const hasRecordedToday = currentDay > 0
      ? !!getDailyMeta(currentDay)
      : false

    set({
      journeyId: stored.journeyId,
      startDate: stored.startDate,
      status: stored.status,
      currentDay,
      hasRecordedToday,
    })
  },
}))
