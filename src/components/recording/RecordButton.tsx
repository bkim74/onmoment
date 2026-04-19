import { useRecordingStore } from '../../stores/useRecordingStore'
import { useMediaRecorder } from '../../hooks/useMediaRecorder'

export default function RecordButton() {
  const weather = useRecordingStore((s) => s.weather)
  const isRecording = useRecordingStore((s) => s.isRecording)
  const { start } = useMediaRecorder()

  if (isRecording) return null

  const handleTap = async () => {
    if (!weather) {
      const el = document.getElementById('weather-hint')
      el?.classList.add('animate-bounce')
      setTimeout(() => el?.classList.remove('animate-bounce'), 1000)
      return
    }
    await start()
  }

  return (
    <div className="flex flex-col items-center">
      {!weather && (
        <p id="weather-hint" className="text-sm text-om-purple mb-3">
          먼저 오늘의 마음 날씨를 선택하세요
        </p>
      )}
      <button
        onClick={handleTap}
        className="w-[120px] h-[120px] rounded-full gradient-purple flex flex-col items-center justify-center text-white shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/50 active:scale-95 transition-all"
        aria-label="녹음 시작"
      >
        <span className="text-4xl mb-1">🎙️</span>
        <span className="text-sm font-medium">녹음</span>
      </button>
    </div>
  )
}
