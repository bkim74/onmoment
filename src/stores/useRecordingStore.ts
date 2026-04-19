import { create } from 'zustand'
import type { WeatherState } from '../services/storage'

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  maxDuration: number
  weather: WeatherState | null
  audioBlob: Blob | null
  setWeather: (w: WeatherState) => void
  setRecording: (v: boolean) => void
  setPaused: (v: boolean) => void
  setDuration: (d: number) => void
  setAudioBlob: (b: Blob | null) => void
  reset: () => void
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  isPaused: false,
  duration: 0,
  maxDuration: 90,
  weather: null,
  audioBlob: null,
  setWeather: (w) => set({ weather: w }),
  setRecording: (v) => set({ isRecording: v }),
  setPaused: (v) => set({ isPaused: v }),
  setDuration: (d) => set({ duration: d }),
  setAudioBlob: (b) => set({ audioBlob: b }),
  reset: () =>
    set({
      isRecording: false,
      isPaused: false,
      duration: 0,
      weather: null,
      audioBlob: null,
    }),
}))
