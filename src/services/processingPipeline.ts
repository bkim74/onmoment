import { transcribeAudio } from './whisper'
import { analyzeEmotion } from './gemini'
import { detectCrisisLevel, CRISIS_RESPONSE, selectGuruPersona } from './safety'
import {
  saveAudioBlob,
  saveDailyMeta,
  getApiKeys,
  getJourney,
  type DailyMeta,
} from './storage'

export interface ProcessingResult {
  transcript: string
  guruResponse: string
  guruId: string
  sdfScore: number
  isCrisis: boolean
}

export async function processRecording(blob: Blob, weather: string): Promise<ProcessingResult> {
  const keys = getApiKeys()
  if (!keys?.openai || !keys?.gemini) {
    throw new Error('API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.')
  }

  const journey = getJourney()
  if (!journey?.journeyId) {
    throw new Error('여정이 시작되지 않았습니다.')
  }

  // Step 1: STT
  const transcript = await transcribeAudio(blob, keys.openai)

  // Step 2: Safety check
  const crisisLevel = detectCrisisLevel(transcript)

  if (crisisLevel === 'crisis') {
    const meta: DailyMeta = {
      dayNumber: journey.currentDay,
      weather: weather as DailyMeta['weather'],
      transcript,
      guruId: 'comfort',
      guruResponse: CRISIS_RESPONSE,
      sdfScore: 0,
      isCrisis: true,
      recordedAt: new Date().toISOString(),
    }
    saveDailyMeta(meta)
    await saveAudioBlob(journey.journeyId, journey.currentDay, blob)

    return {
      transcript,
      guruResponse: CRISIS_RESPONSE,
      guruId: 'comfort',
      sdfScore: 0,
      isCrisis: true,
    }
  }

  // Step 3: Select guru & analyze
  const guruId = selectGuruPersona(transcript)
  const analysis = await analyzeEmotion(transcript, weather, guruId, keys.gemini)

  const cautionSuffix =
    crisisLevel === 'caution'
      ? '\n\n💡 당신은 혼자가 아닙니다. 필요할 때 언제든 1393(자살예방상담전화)로 연락하세요.'
      : ''

  const guruResponse = analysis.response + cautionSuffix

  // Step 4: Save
  const meta: DailyMeta = {
    dayNumber: journey.currentDay,
    weather: weather as DailyMeta['weather'],
    transcript,
    guruId,
    guruResponse,
    sdfScore: analysis.sdfScore,
    isCrisis: false,
    recordedAt: new Date().toISOString(),
  }
  saveDailyMeta(meta)
  await saveAudioBlob(journey.journeyId, journey.currentDay, blob)

  return {
    transcript,
    guruResponse,
    guruId,
    sdfScore: analysis.sdfScore,
    isCrisis: false,
  }
}
