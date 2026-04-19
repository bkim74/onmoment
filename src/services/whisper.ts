export async function transcribeAudio(blob: Blob, apiKey: string): Promise<string> {
  const formData = new FormData()
  const extension = blob.type.includes('webm') ? 'webm' : blob.type.includes('ogg') ? 'ogg' : 'mp4'
  formData.append('file', blob, `recording.${extension}`)
  formData.append('model', 'whisper-1')
  formData.append('language', 'ko')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Whisper API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.text as string
}
