import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getGift } from '../services/storage'
import AudioPlayer from '../components/common/AudioPlayer'
import type { GiftData } from '../services/storage'

export default function Gift() {
  const { id } = useParams<{ id: string }>()
  const [gift, setGift] = useState<GiftData | null>(null)
  const [audioBlobs, setAudioBlobs] = useState<Map<number, Blob>>(new Map())

  useEffect(() => {
    const data = getGift()
    if (data && (!id || data.journeyId === id)) {
      setGift(data)
    }
  }, [id])

  useEffect(() => {
    if (!gift) return
    const loadBlobs = async () => {
      const { getAudioBlob, getJourney } = await import('../services/storage')
      const journey = getJourney()
      if (!journey?.journeyId) return

      const map = new Map<number, Blob>()
      for (const day of gift.highlightDays) {
        const blob = await getAudioBlob(journey.journeyId, day)
        if (blob) map.set(day, blob)
      }
      setAudioBlobs(map)
    }
    loadBlobs()
  }, [gift])

  if (!gift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-6 gradient-dark text-white">
        <p className="text-purple-200">선물을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/gift/${gift.journeyId}`
    try {
      await navigator.clipboard.writeText(url)
      alert('링크가 복사되었습니다!')
    } catch {
      // Fallback
      prompt('링크를 복사하세요:', url)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh gradient-dark text-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-purple-300 mb-2">당신의 선물</p>
        <h1 className="text-om-large font-bold mb-8">한 문장의 선물</h1>

        <div className="w-full max-w-sm">
          <div className="border-t border-purple-500/30 mb-6" />
          <p className="text-xl leading-relaxed font-medium px-4">
            "{gift.oneSentence}"
          </p>
          <div className="border-t border-purple-500/30 mt-6" />
        </div>

        {/* Highlight audio clips */}
        {gift.highlightDays.length > 0 && (
          <div className="w-full max-w-sm mt-10">
            <p className="text-sm text-purple-300 mb-4">하이라이트 음성</p>
            <div className="space-y-3">
              {gift.highlightDays.map((day) => {
                const blob = audioBlobs.get(day)
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-purple-300 w-16">Day {day}</span>
                    {blob ? (
                      <AudioPlayer blob={blob} />
                    ) : (
                      <span className="text-xs text-gray-500">음성 없음</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleShare}
        className="w-full py-4 rounded-om-lg bg-[#FEE500] text-[#191919] font-bold flex items-center justify-center gap-2"
      >
        💬 공유하기
      </button>
    </div>
  )
}
