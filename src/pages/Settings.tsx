import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { getApiKeys, saveApiKeys, resetAllData } from '../services/storage'

export default function Settings() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const stored = getApiKeys()
  const [openaiKey, setOpenaiKey] = useState(stored?.openai ?? '')
  const [geminiKey, setGeminiKey] = useState(stored?.gemini ?? '')
  const [showOpenai, setShowOpenai] = useState(false)
  const [showGemini, setShowGemini] = useState(false)

  const handleSaveKeys = () => {
    saveApiKeys({ openai: openaiKey, gemini: geminiKey })
    alert('API 키가 저장되었습니다')
  }

  const handleExport = () => {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('onmoment_')) {
        data[key] = JSON.parse(localStorage.getItem(key) ?? '""')
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onmoment-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (!confirm('정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    if (!confirm('마지막 확인: 모든 기록이 삭제됩니다.')) return
    resetAllData()
    logout()
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-dvh p-6">
      <h1 className="text-om-heading font-bold text-om-dark mb-6">설정</h1>

      {/* Profile */}
      {user && (
        <div className="rounded-om-lg p-4 glass mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center text-white text-xl">
              {user.nickname[0]}
            </div>
            <div>
              <p className="font-bold text-om-dark">{user.nickname}</p>
              <p className="text-xs text-gray-400">카카오 계정 연동</p>
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 mb-3">API 키</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">OpenAI API Key</label>
            <div className="flex gap-2">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 rounded-om border border-gray-200 text-sm"
              />
              <button onClick={() => setShowOpenai(!showOpenai)} className="text-sm text-gray-400 px-2">
                {showOpenai ? '숨기기' : '보기'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AI..."
                className="flex-1 px-3 py-2 rounded-om border border-gray-200 text-sm"
              />
              <button onClick={() => setShowGemini(!showGemini)} className="text-sm text-gray-400 px-2">
                {showGemini ? '숨기기' : '보기'}
              </button>
            </div>
          </div>
          <button
            onClick={handleSaveKeys}
            className="w-full py-2 rounded-om gradient-purple text-white font-bold text-sm"
          >
            저장
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 mb-3">데이터 관리</h2>
        <div className="space-y-2">
          <button onClick={handleExport} className="w-full py-2 rounded-om border border-gray-200 text-sm">
            📤 데이터 내보내기
          </button>
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-om border border-red-200 text-red-500 text-sm"
          >
            🗑️ 전체 데이터 삭제
          </button>
        </div>
      </div>

      {/* Safety */}
      <div className="rounded-om-lg p-4 bg-red-50 border border-red-100">
        <h2 className="text-sm font-bold text-red-600 mb-2">도움이 필요하신가요?</h2>
        <p className="text-xs text-red-500 mb-1">📞 자살예방 상담전화: 1393</p>
        <p className="text-xs text-red-500 mb-1">📞 정신건강 상담전화: 1577-0199</p>
        <p className="text-xs text-red-500">📞 긴급구급: 119</p>
      </div>
    </div>
  )
}
