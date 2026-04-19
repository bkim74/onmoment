import { useRecordingStore } from '../../stores/useRecordingStore'

export default function WaveformVisualizer() {
  const isPaused = useRecordingStore((s) => s.isPaused)

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full bg-om-purple/70 ${
            isPaused ? '' : 'animate-pulse'
          }`}
          style={{
            height: `${20 + Math.random() * 40}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  )
}
