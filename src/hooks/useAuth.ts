// Supabase 인증 상태 감지 커스텀 훅
// onAuthStateChange를 사용해 실시간으로 로그인 상태를 추적합니다.
// 로딩 상태를 관리하여 초기 깜빡임을 방지합니다.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// 인증 상태 반환 타입
interface AuthState {
  // 현재 로그인된 유저 (null이면 비로그인)
  user: User | null;
  // 인증 상태 확인 중 여부 (초기 로딩)
  isLoading: boolean;
  // 로그인 여부 (로딩 완료 후에만 신뢰 가능)
  isLoggedIn: boolean;
}

export function useAuth(): AuthState {
  // 유저 정보 상태
  const [user, setUser] = useState<User | null>(null);
  // 초기 로딩 상태 (true로 시작하여 깜빡임 방지)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 현재 세션에서 유저 정보를 가져옵니다
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // 인증 상태 변경을 실시간으로 감지합니다
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn: !isLoading && !!user,
  };
}
