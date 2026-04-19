import { get, set, del } from 'idb-keyval'

const LS_PREFIX = 'onmoment_'

function lsGet<T>(key: string): T | null {
  const raw = localStorage.getItem(LS_PREFIX + key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function lsSet(key: string, value: unknown): void {
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(value))
}

// Audio blobs (IndexedDB)
export async function saveAudioBlob(journeyId: string, dayNumber: number, blob: Blob): Promise<void> {
  await set(`audio_${journeyId}_${dayNumber}`, blob)
}

export async function getAudioBlob(journeyId: string, dayNumber: number): Promise<Blob | undefined> {
  return await get<Blob>(`audio_${journeyId}_${dayNumber}`)
}

export async function deleteAudioBlob(journeyId: string, dayNumber: number): Promise<void> {
  await del(`audio_${journeyId}_${dayNumber}`)
}

// Daily metadata (localStorage)
export interface DailyMeta {
  dayNumber: number
  weather: WeatherState
  transcript: string
  guruId: GuruType
  guruResponse: string
  sdfScore: number
  isCrisis: boolean
  recordedAt: string
}

export type WeatherState = 'sunny' | 'partlyCloudy' | 'cloudy' | 'rainy' | 'stormy'
export type GuruType = 'comfort' | 'growth' | 'connection' | 'healing'

export function saveDailyMeta(meta: DailyMeta): void {
  const all = getDailyMetaAll()
  const idx = all.findIndex((m) => m.dayNumber === meta.dayNumber)
  if (idx >= 0) {
    all[idx] = meta
  } else {
    all.push(meta)
  }
  lsSet('daily_meta', all)
}

export function getDailyMetaAll(): DailyMeta[] {
  return lsGet<DailyMeta[]>('daily_meta') ?? []
}

export function getDailyMeta(dayNumber: number): DailyMeta | undefined {
  return getDailyMetaAll().find((m) => m.dayNumber === dayNumber)
}

// Journey
export interface JourneyData {
  journeyId: string
  startDate: string
  status: 'idle' | 'onboarding' | 'active' | 'completed'
  currentDay: number
}

export function saveJourney(data: JourneyData): void {
  lsSet('journey', data)
}

export function getJourney(): JourneyData | null {
  return lsGet<JourneyData>('journey')
}

// User
export interface UserData {
  id: string
  nickname: string
  profileImageUrl?: string
}

export function saveUser(data: UserData): void {
  lsSet('user', data)
}

export function getUser(): UserData | null {
  return lsGet<UserData>('user')
}

// Milestones
export interface MilestoneData {
  day: number
  summary: string
  generatedAt: string
}

export function saveMilestones(data: MilestoneData[]): void {
  lsSet('milestones', data)
}

export function getMilestones(): MilestoneData[] {
  return lsGet<MilestoneData[]>('milestones') ?? []
}

// Gift
export interface GiftData {
  journeyId: string
  oneSentence: string
  highlightDays: number[]
  accessCode: string
  createdAt: string
}

export function saveGift(data: GiftData): void {
  lsSet('gift', data)
}

export function getGift(): GiftData | null {
  return lsGet<GiftData>('gift')
}

// API Keys
export interface ApiKeys {
  openai: string
  gemini: string
}

export function saveApiKeys(keys: ApiKeys): void {
  lsSet('api_keys', keys)
}

export function getApiKeys(): ApiKeys | null {
  return lsGet<ApiKeys>('api_keys')
}

// Reset all data
export function resetAllData(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(LS_PREFIX))
  keys.forEach((k) => localStorage.removeItem(k))
}
