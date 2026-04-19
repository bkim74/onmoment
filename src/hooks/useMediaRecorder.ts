import { useRef, useCallback } from 'react'
import { useRecordingStore } from '../stores/useRecordingStore'

export function useMediaRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const store = useRecordingStore()

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        store.setAudioBlob(blob)
        store.setRecording(false)
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
      }

      recorder.start(1000)
      store.setRecording(true)
      store.setPaused(false)
      store.setDuration(0)

      timerRef.current = setInterval(() => {
        const d = useRecordingStore.getState().duration + 1
        store.setDuration(d)
        if (d >= store.maxDuration) {
          stop()
        }
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
      throw err
    }
  }, [store])

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      store.setPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [store])

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      store.setPaused(false)
      timerRef.current = setInterval(() => {
        const d = useRecordingStore.getState().duration + 1
        store.setDuration(d)
        if (d >= store.maxDuration) {
          stop()
        }
      }, 1000)
    }
  }, [store])

  const stop = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' ||
        mediaRecorderRef.current.state === 'paused')
    ) {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const cancel = useCallback(() => {
    stop()
    chunksRef.current = []
    store.reset()
  }, [stop, store])

  return { start, pause, resume, stop, cancel }
}
