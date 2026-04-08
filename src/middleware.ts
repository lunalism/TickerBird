import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 미들웨어
 * - 매 요청마다 Supabase 세션을 갱신합니다 (1회만 호출)
 * - 쿠키 기반으로 로그인 여부를 판별합니다 (추가 네트워크 요청 없음)
 * - 인증이 필요한 라우트를 보호합니다
 * - 로그인된 유저가 /login 접근 시 /news로 리다이렉트합니다
 */
export async function middleware(request: NextRequest) {
  // 세션 갱신 (내부에서 getUser() 1회 호출)
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 쿠키에서 로그인 여부만 간단히 확인 (추가 네트워크 요청 없음)
  // updateSession에서 세션 갱신 후 request.cookies에 토큰이 반영되어 있음
  const hasSession =
    request.cookies.has("sb-xrtulnnwksivlbtgywhr-auth-token") ||
    request.cookies.has("sb-xrtulnnwksivlbtgywhr-auth-token.0") ||
    request.cookies.has("sb-xrtulnnwksivlbtgywhr-auth-token.1");

  // 인증이 필요한 경로 (/news는 비로그인도 접근 가능)
  const isProtectedRoute =
    pathname.startsWith("/reports") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  // 관리자 경로 (로그인 필수, 관리자 여부는 서버 컴포넌트에서 추가 검증)
  const isAdminRoute = pathname.startsWith("/admin");

  // 로그인 페이지 경로
  const isAuthRoute = pathname.startsWith("/login");

  // 비로그인 유저가 보호된 경로에 접근하면 로그인 페이지로 리다이렉트
  if ((isProtectedRoute || isAdminRoute) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 이미 로그인된 유저가 로그인 페이지에 접근하면 /news로 리다이렉트
  if (isAuthRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/news";
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * 미들웨어가 실행될 경로를 설정합니다.
 * API 라우트, 정적 파일, 이미지 등은 제외합니다.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
