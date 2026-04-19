import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '../stores/useJourneyStore'
import { useRecordingStore } from '../stores/useRecordingStore'
import { useAuthStore } from '../stores/useAuthStore'
import { processRecording } from '../services/processingPipeline'
import { getDailyMeta } from '../services/storage'
import WeatherSelector from '../components/weather/WeatherSelector'
import RecordButton from '../components/recording/RecordButton'
import RecordingScreen from '../components/recording/RecordingScreen'
import ProgressBar from '../components/common/ProgressBar'

type ProcessingStep = 'idle' | 'stt' | 'analysis' | 'done'

export default function Main() {
  const navigate = useNavigate()
  const nickname = useAuthStore((s) => s.user?.nickname ?? '여행자')
  const currentDay = useJourneyStore((s) => s.currentDay)
  const hasRecordedToday = useJourneyStore((s) => s.hasRecordedToday)
  const markRecorded = useJourneyStore((s) => s.markRecorded)
  const advanceDay = useJourneyStore((s) => s.advanceDay)
  const isRecording = useRecordingStore((s) => s.isRecording)
  const audioBlob = useRecordingStore((s) => s.audioBlob)
  const weather = useRecordingStore((s) => s.weather)
  const resetRecording = useRecordingStore((s) => s.reset)

  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const [yesterdayMeta, setYesterdayMeta] = useState<{
    guruId: string
    response: string
    isCrisis: boolean
  } | null>(null)

  useEffect(() => {
    if (currentDay > 1) {
      const meta = getDailyMeta(currentDay - 1)
      if (meta) {
        setYesterdayMeta({
          guruId: meta.guruId,
          response: meta.guruResponse,
          isCrisis: meta.isCrisis,
        })
      }
    }
  }, [currentDay])

  useEffect(() => {
    if (!audioBlob || !weather) return

    const process = async () => {
      try {
        setProcessingStep('stt')
        await processRecording(audioBlob, weather)

        setProcessingStep('analysis')

        await new Promise((r) => setTimeout(r, 500))
        setProcessingStep('done')
        markRecorded()

        setTimeout(() => {
          advanceDay()
          navigate(`/response/${currentDay}`)
          resetRecording()
          setProcessingStep('idle')
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다')
        setProcessingStep('idle')
        resetRecording()
      }
    }

    process()
  }, [audioBlob, weather, currentDay, markRecorded, advanceDay, navigate, resetRecording])

  if (isRecording) {
    return <RecordingScreen />
  }

  if (processingStep !== 'idle') {
    const steps = [
      { key: 'stt', label: '음성을 텍스트로 변환 중...' },
      { key: 'analysis', label: '감정을 분석하고 있어요...' },
      { key: 'done', label: '응답을 준비하고 있어요...' },
    ]
    const activeIdx = steps.findIndex((s) => s.key === processingStep)

    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-6 gradient-dark text-white">
        <div className="text-4xl mb-6 animate-pulse">✨</div>
        {steps.map((step, i) => (
          <p
            key={step.key}
            className={`text-sm mb-2 transition-opacity ${
              i <= activeIdx ? 'text-white opacity-100' : 'text-white/30'
            }`}
          >
            {i <= activeIdx ? '● ' : '○ '}
            {step.label}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh p-6">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-sm text-gray-400">오늘도 만나서 반가워요</p>
        <h1 className="text-om-large font-bold text-om-dark">{nickname}님</h1>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Day {currentDay} / 40</span>
          <span>{40 - currentDay}일 남음</span>
        </div>
        <ProgressBar percentage={(currentDay / 40) * 100} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-om bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-400 mt-1">
            닫기
          </button>
        </div>
      )}

      {hasRecordedToday ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🌟</div>
          <p className="text-om-heading font-bold text-om-dark mb-2">오늘의 기록 완료!</p>
          <p className="text-om-body text-gray-500 mb-6">내일 또 만나요</p>
          <button
            onClick={() => navigate(`/response/${currentDay}`)}
            className="px-6 py-3 rounded-om gradient-purple text-white font-bold"
          >
            오늘의 응답 보기
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-400 mb-4">오늘의 마음 날씨</p>
          <WeatherSelector />
          <div className="mt-8">
            <RecordButton />
          </div>
        </div>
      )}

      {/* Yesterday's response teaser */}
      {yesterdayMeta && !hasRecordedToday && (
        <div
          className="mt-6 rounded-om-lg p-4 glass cursor-pointer"
          onClick={() => navigate(`/response/${currentDay - 1}`)}
        >
          <p className="text-xs text-gray-400 mb-2">어제의 응답</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {yesterdayMeta.response.replace(/"/g, '')}
          </p>
          <p className="text-xs text-om-purple mt-2">전체 보기 →</p>
        </div>
      )}
    </div>
  )
}
