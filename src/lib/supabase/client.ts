import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저(클라이언트 컴포넌트)에서 사용할 Supabase 클라이언트를 생성합니다.
 * 클라이언트 컴포넌트에서 Supabase에 접근할 때 이 함수를 사용하세요.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
