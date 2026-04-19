import type { GuruType } from './storage'
import { buildGuruPrompt, buildMilestonePrompt, buildOneSentencePrompt } from './guruPrompts'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface GuruAnalysis {
  response: string
  emotionKeywords: string[]
  sdfScore: number
}

export async function analyzeEmotion(
  transcript: string,
  weather: string,
  guruType: GuruType,
  apiKey: string,
): Promise<GuruAnalysis> {
  const prompt = buildGuruPrompt(transcript, weather, guruType)

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        response: parsed.response ?? text,
        emotionKeywords: parsed.emotion_keywords ?? [],
        sdfScore: parsed.sdf_score ?? 0.5,
      }
    }
  } catch {
    // fall through to raw text
  }

  return { response: text, emotionKeywords: [], sdfScore: 0.5 }
}

export async function generateMilestoneSummary(
  dailySummaries: string[],
  milestoneDay: number,
  apiKey: string,
): Promise<string> {
  const prompt = buildMilestonePrompt(dailySummaries, milestoneDay)

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function generateOneSentence(
  allTranscripts: string[],
  apiKey: string,
): Promise<string> {
  const prompt = buildOneSentencePrompt(allTranscripts)

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 200 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
