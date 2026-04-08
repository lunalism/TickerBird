import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// CSRF 대비: 운영 배포 전 Supabase 세션 쿠키의 SameSite 속성 확인 필요.
// @supabase/ssr 기본값은 SameSite=Lax이지만, 보안 강화를 위해
// SameSite=Strict + Secure 적용을 검토해야 합니다.
// (참고: setAll 콜백의 options에서 sameSite: "strict"로 override 가능)

/**
 * 서버(서버 컴포넌트, API Route)에서 사용할 Supabase 클라이언트를 생성합니다.
 * 서버 컴포넌트나 서버 액션에서 Supabase에 접근할 때 이 함수를 사용하세요.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 모든 쿠키를 가져옵니다
        getAll() {
          return cookieStore.getAll();
        },
        // 쿠키를 설정합니다 (서버 컴포넌트에서는 불가능할 수 있음)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 쿠키 설정 시 에러가 발생할 수 있습니다.
            // 미들웨어에서 세션 갱신이 처리되므로 무시해도 안전합니다.
          }
        },
      },
    }
  );
}
