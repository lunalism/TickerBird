import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 미들웨어에서 사용할 Supabase 클라이언트를 생성하고 세션을 갱신합니다.
 * 모든 요청마다 실행되어 인증 세션을 최신 상태로 유지합니다.
 */
export async function updateSession(request: NextRequest) {
  // 응답 객체를 생성합니다
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Supabase 클라이언트를 생성합니다
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 요청에서 모든 쿠키를 가져옵니다
        getAll() {
          return request.cookies.getAll();
        },
        // 요청과 응답 모두에 쿠키를 설정합니다
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션을 갱신합니다 (만료된 토큰을 자동으로 새로고침)
  // 주의: getUser()를 반드시 호출해야 세션이 갱신됩니다
  await supabase.auth.getUser();

  return supabaseResponse;
}
