import { useRecordingStore } from '../../stores/useRecordingStore'
import { useMediaRecorder } from '../../hooks/useMediaRecorder'
import Timer from './Timer'
import WaveformVisualizer from './WaveformVisualizer'

export default function RecordingScreen() {
  const isPaused = useRecordingStore((s) => s.isPaused)
  const { pause, resume, stop, cancel } = useMediaRecorder()

  return (
    <div className="fixed inset-0 gradient-dark flex flex-col items-center justify-center z-50 p-6">
      <p className="text-purple-200 text-sm mb-8">오늘의 이야기를 들려주세요</p>

      <WaveformVisualizer />
      <div className="my-8">
        <Timer />
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={cancel}
          className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xl"
          aria-label="다시 녹음"
        >
          ↺
        </button>

        <button
          onClick={isPaused ? resume : pause}
          className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl border-2 border-white/30"
          aria-label={isPaused ? '계속' : '일시정지'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>

        <button
          onClick={stop}
          className="w-14 h-14 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xl"
          aria-label="녹음 완료"
        >
          ⏹
        </button>
      </div>
    </div>
  )
}
