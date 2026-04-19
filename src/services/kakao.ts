declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Auth: {
        login: (options: {
          success: (auth: { access_token: string }) => void
          fail: (err: unknown) => void
        }) => void
        logout: (options?: { success?: () => void }) => void
      }
      API: {
        request: (options: {
          url: string
          success: (res: unknown) => void
          fail: (err: unknown) => void
        }) => void
      }
    }
  }
}

export interface KakaoUser {
  id: string
  nickname: string
  profileImageUrl?: string
}

export function initKakao(appKey: string): void {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(appKey)
  }
}

export function loginWithKakao(): Promise<KakaoUser> {
  return new Promise((resolve, reject) => {
    if (!window.Kakao) {
      reject(new Error('Kakao SDK가 로드되지 않았습니다'))
      return
    }

    window.Kakao.Auth.login({
      success: () => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: unknown) => {
            const data = res as { id: number; properties?: { nickname?: string; profile_image?: string } }
            resolve({
              id: String(data.id),
              nickname: data.properties?.nickname ?? '여행자',
              profileImageUrl: data.properties?.profile_image,
            })
          },
          fail: (err) => reject(err),
        })
      },
      fail: (err) => reject(err),
    })
  })
}

export function logoutKakao(): void {
  if (window.Kakao) {
    window.Kakao.Auth.logout()
  }
}
