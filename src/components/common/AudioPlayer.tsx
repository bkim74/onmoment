import { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ blob }: { blob: Blob }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const url = URL.createObjectURL(blob)
    urlRef.current = url
    const audio = new Audio(url)
    audioRef.current = audio
    audio.addEventListener('ended', () => setPlaying(false))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    return () => {
      audio.pause()
      URL.revokeObjectURL(url)
    }
  }, [blob])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-om glass">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-white text-lg"
      >
        {playing ? '⏸' : '▶'}
      </button>
      <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-om-purple rounded-full" style={{ width: '0%' }} />
      </div>
      <span className="text-xs text-gray-400">{fmt(duration)}</span>
    </div>
  )
}
