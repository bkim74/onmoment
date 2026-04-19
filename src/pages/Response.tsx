import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDailyMeta, getJourney, getAudioBlob } from '../services/storage'
import type { DailyMeta } from '../services/storage'
import GuruResponseCard from '../components/guru/GuruResponse'
import AudioPlayer from '../components/common/AudioPlayer'

export default function Response() {
  const { day } = useParams<{ day: string }>()
  const navigate = useNavigate()
  const [meta, setMeta] = useState<DailyMeta | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  useEffect(() => {
    const dayNum = Number(day)
    if (isNaN(dayNum)) return

    const m = getDailyMeta(dayNum)
    if (m) setMeta(m)

    const journey = getJourney()
    if (journey?.journeyId) {
      getAudioBlob(journey.journeyId, dayNum).then((b) => {
        if (b) setAudioBlob(b)
      })
    }
  }, [day])

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-6">
        <p className="text-om-body text-gray-500">아직 기록이 없습니다</p>
        <button onClick={() => navigate('/main')} className="mt-4 text-om-purple font-bold">
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-2xl mr-3">←</button>
        <h1 className="text-om-heading font-bold text-om-dark">Day {day}</h1>
      </div>

      <div className="flex-1 space-y-6">
        <GuruResponseCard
          guruId={meta.guruId}
          response={meta.guruResponse}
          isCrisis={meta.isCrisis}
        />

        {meta.transcript && (
          <div className="rounded-om p-4 bg-white/50">
            <p className="text-xs text-gray-400 mb-1">음성 텍스트</p>
            <p className="text-om-body text-gray-600">{meta.transcript}</p>
          </div>
        )}

        {audioBlob && (
          <div>
            <p className="text-xs text-gray-400 mb-2">원본 음성</p>
            <AudioPlayer blob={audioBlob} />
          </div>
        )}
      </div>
    </div>
  )
}
