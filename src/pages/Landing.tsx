import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useJourneyStore } from '../stores/useJourneyStore'

const VALUE_PROPS = [
  { icon: '🎙️', title: '하루 1분 음성 기록', desc: '당신의 목소리로 오늘의 이야기를 남겨요' },
  { icon: '🤖', title: 'AI 구루의 따뜻한 응답', desc: '감정을 분석해 개인 맞춤 응답을 전합니다' },
  { icon: '🎁', title: '사랑하는 사람에게 선물', desc: '40일의 기록이 한 문장의 선물이 됩니다' },
]

export default function Landing() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const login = useAuthStore((s) => s.login)
  const journeyStatus = useJourneyStore((s) => s.status)

  // Redirect if already logged in
  if (isLoggedIn) {
    if (journeyStatus === 'idle' || journeyStatus === 'onboarding') {
      navigate('/onboarding', { replace: true })
    } else {
      navigate('/main', { replace: true })
    }
    return null
  }

  const handleKakaoLogin = async () => {
    try {
      const { loginWithKakao, initKakao } = await import('../services/kakao')
      const appKey = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined
      if (appKey) {
        initKakao(appKey)
        const user = await loginWithKakao()
        login({ id: user.id, nickname: user.nickname, profileImageUrl: user.profileImageUrl })
      } else {
        // Dev mode: skip actual Kakao login
        login({ id: crypto.randomUUID(), nickname: '여행자' })
      }
      navigate('/onboarding')
    } catch {
      // Fallback: dev login
      login({ id: crypto.randomUUID(), nickname: '여행자' })
      navigate('/onboarding')
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-6xl mb-6">🌙</div>
        <h1 className="text-3xl font-bold text-om-dark mb-4 leading-snug">
          당신의 가장 연약한 순간이<br />
          누군가에게 가장 강력한 선물이 됩니다
        </h1>
        <p className="text-om-body text-gray-500 max-w-sm mb-10">
          매일 1분, 40일간의 음성 기록이<br />
          AI와 함께 하나의 선물로 완성됩니다
        </p>

        {/* Value Props */}
        <div className="w-full max-w-sm space-y-4 mb-10">
          {VALUE_PROPS.map((p) => (
            <div key={p.title} className="flex items-start gap-4 p-4 rounded-om-lg glass">
              <span className="text-2xl">{p.icon}</span>
              <div className="text-left">
                <h3 className="font-bold text-sm text-om-dark">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleKakaoLogin}
          className="w-full max-w-sm py-4 rounded-om-lg bg-[#FEE500] text-[#191919] font-bold text-lg flex items-center justify-center gap-2 shadow-md"
        >
          <span>💬</span> 카카오로 시작하기
        </button>

        <p className="text-xs text-gray-400 mt-4">
          3일 무료 체험 → 40일 여정
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-300">
        아이에게 초대받으셨나요?
      </div>
    </div>
  )
}
