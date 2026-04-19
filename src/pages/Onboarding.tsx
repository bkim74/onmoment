import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '../stores/useJourneyStore'
import { useRecordingStore } from '../stores/useRecordingStore'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { saveDailyMeta } from '../services/storage'
import Timer from '../components/recording/Timer'
import WaveformVisualizer from '../components/recording/WaveformVisualizer'

const QUESTIONS = [
  '오늘 하루, 가장 기억에 남는 순간은 무엇이었나요?',
  '지금 가장 느끼는 감정은 무엇인가요?',
  '내일 하고 싶은 한 가지는 무엇인가요?',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const startOnboarding = useJourneyStore((s) => s.startOnboarding)
  const startJourney = useJourneyStore((s) => s.startJourney)
  const journeyId = useJourneyStore((s) => s.journeyId)

  const isRecording = useRecordingStore((s) => s.isRecording)
  const isPaused = useRecordingStore((s) => s.isPaused)
  const audioBlob = useRecordingStore((s) => s.audioBlob)
  const resetRecording = useRecordingStore((s) => s.reset)

  const { start, pause, resume, stop, cancel } = useMediaRecorder()

  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState<boolean[]>([false, false, false])

  const handleStartRecording = async () => {
    if (!journeyId) startOnboarding()
    await start()
  }

  const handleComplete = () => {
    stop()
  }

  const handleCancel = () => {
    cancel()
  }

  // After recording blob is saved for this step
  const handleNext = () => {
    if (audioBlob) {
      // Save a simple meta for onboarding days
      saveDailyMeta({
        dayNumber: -(step + 1), // negative for onboarding days
        weather: 'sunny',
        transcript: '(온보딩 녹음)',
        guruId: 'connection',
        guruResponse: `${step + 1}일차 미니 의식 완료!`,
        sdfScore: 0.5,
        isCrisis: false,
        recordedAt: new Date().toISOString(),
      })
    }

    const newCompleted = [...completed]
    newCompleted[step] = true
    setCompleted(newCompleted)
    resetRecording()

    if (step < 2) {
      setStep(step + 1)
    }
  }

  if (completed.every(Boolean)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-om-large font-bold text-om-dark mb-3">3일 완료!</h1>
        <p className="text-om-body text-gray-500 mb-8 max-w-sm">
          이제 본격적인 40일 여정을 시작할 준비가 되었어요.
        </p>
        <button
          onClick={() => {
            startJourney()
            navigate('/main')
          }}
          className="px-8 py-4 rounded-om-lg gradient-purple text-white font-bold text-lg shadow-lg shadow-purple-300/40"
        >
          40일 여정 시작하기
        </button>
      </div>
    )
  }

  if (isRecording) {
    return (
      <div className="fixed inset-0 gradient-dark flex flex-col items-center justify-center z-50 p-6">
        <p className="text-purple-200 text-sm mb-2">3일 미니 의식 — {step + 1}/3</p>
        <p className="text-white text-om-heading font-bold text-center mb-8">
          {QUESTIONS[step]}
        </p>
        <WaveformVisualizer />
        <div className="my-8">
          <Timer />
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={handleCancel}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xl"
          >
            ↺
          </button>
          <button
            onClick={isPaused ? resume : pause}
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl border-2 border-white/30"
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={handleComplete}
            className="w-14 h-14 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xl"
          >
            ⏹
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6">
      {/* Progress dots */}
      <div className="flex gap-3 mb-8">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              completed[i]
                ? 'bg-om-purple'
                : i === step
                  ? 'bg-om-purple/50 scale-125'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-3">3일 미니 의식 — {step + 1}/3</p>
      <h1 className="text-om-heading font-bold text-om-dark text-center mb-8 max-w-sm">
        {QUESTIONS[step]}
      </h1>

      {audioBlob ? (
        <div className="space-y-4 text-center">
          <div className="text-4xl">✅</div>
          <p className="text-om-body text-gray-500">녹음 완료!</p>
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-om gradient-purple text-white font-bold"
          >
            {step < 2 ? '다음 질문' : '완료'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleStartRecording}
          className="w-[120px] h-[120px] rounded-full gradient-purple flex flex-col items-center justify-center text-white shadow-lg shadow-purple-300/50"
        >
          <span className="text-4xl mb-1">🎙️</span>
          <span className="text-sm font-medium">녹음</span>
        </button>
      )}
    </div>
  )
}
