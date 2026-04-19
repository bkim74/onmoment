import type { GuruType } from './storage'

const CRISIS_KEYWORDS_KO = [
  '죽고 싶', '자살', '죽을래', '죽겠', '살고 싶지 않',
  '죽어야', '목 매', '뛰어내리', '끝내고 싶',
  '사라지고 싶', '깨어나고 싶지 않', '잠들고 싶',
  '더 이상 못 견디', '포기', '허무', '의미 없',
]

const CAUTION_KEYWORDS_KO = [
  '우울', '외로', '슬프', '힘들', '괴로',
  '불안', '두려', '상실', '고통', '아프',
]

export function detectCrisisLevel(text: string): 'safe' | 'caution' | 'crisis' {
  const lower = text.toLowerCase()

  for (const kw of CRISIS_KEYWORDS_KO) {
    if (lower.includes(kw)) return 'crisis'
  }

  for (const kw of CAUTION_KEYWORDS_KO) {
    if (lower.includes(kw)) return 'caution'
  }

  return 'safe'
}

export const CRISIS_RESPONSE = `당신의 이야기를 들었습니다.
지금 많이 힘들고 고통스러운 시간을 보내고 계신 것 같아요.
당신은 혼자가 아닙니다. 도움을 받을 수 있는 곳이 있습니다.

📞 자살예방 상담전화: 1393
📞 정신건강 상담전화: 1577-0199
📞 긴급구급: 119

언제든 도움을 요청하세요. 당신은 소중한 분입니다.`

export function selectGuruPersona(transcript: string): GuruType {
  const comfortKw = ['슬프', '그리운', '외로', '보고 싶', '그리워']
  const growthKw = ['도전', '성취', '배웠', '노력', '성장', '할 수 있']
  const connectionKw = ['고맙', '감사', '사랑', '기쁘', '행복', '따뜻']
  const healingKw = ['아프', '잃', '두려', '상처', '힘들']

  const scores: Record<GuruType, number> = { comfort: 0, growth: 0, connection: 0, healing: 0 }

  comfortKw.forEach((kw) => { if (transcript.includes(kw)) scores.comfort++ })
  growthKw.forEach((kw) => { if (transcript.includes(kw)) scores.growth++ })
  connectionKw.forEach((kw) => { if (transcript.includes(kw)) scores.connection++ })
  healingKw.forEach((kw) => { if (transcript.includes(kw)) scores.healing++ })

  const max = Math.max(...Object.values(scores))
  if (max === 0) return 'connection'

  return (Object.entries(scores).find(([, v]) => v === max)?.[0] ?? 'connection') as GuruType
}
