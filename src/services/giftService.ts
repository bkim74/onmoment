import { generateOneSentence } from './gemini'
import { getDailyMetaAll, getJourney, saveGift } from './storage'
import type { GiftData } from './storage'

export async function createGift(): Promise<GiftData> {
  const journey = getJourney()
  if (!journey?.journeyId) throw new Error('여정을 찾을 수 없습니다')

  const allMeta = getDailyMetaAll()
  const transcripts = allMeta.map((m) => m.transcript).filter(Boolean)

  // Get API keys
  const keysStr = localStorage.getItem('onmoment_api_keys')
  if (!keysStr) throw new Error('API 키가 설정되지 않았습니다')
  const keys = JSON.parse(keysStr) as { gemini: string }

  const oneSentence = await generateOneSentence(transcripts, keys.gemini)

  // Select highlight days: highest SDF scores + milestone days
  const sorted = [...allMeta].sort((a, b) => b.sdfScore - a.sdfScore)
  const highlightDays = sorted.slice(0, 5).map((m) => m.dayNumber)

  const gift: GiftData = {
    journeyId: journey.journeyId,
    oneSentence,
    highlightDays,
    accessCode: String(Math.floor(100000 + Math.random() * 900000)),
    createdAt: new Date().toISOString(),
  }

  saveGift(gift)
  return gift
}
