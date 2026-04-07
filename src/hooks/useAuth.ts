// Supabase 인증 상태 감지 커스텀 훅
// onAuthStateChange를 사용해 실시간으로 로그인 상태를 추적합니다.
// profiles 테이블에서 최신 display_name을 가져와 닉네임 동기화를 보장합니다.
// 중요: profiles 조회가 완료될 때까지 isLoading을 유지하여 Google 이름 깜빡임을 방지합니다.

"use client";

import { useEffect, useRef, useState } from "react";
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
  // profiles 테이블 기반 표시 이름 (닉네임 동기화용)
  displayName: string;
  // 아바타 URL
  avatarUrl: string;
}

// 최대 재시도 횟수
const MAX_RETRIES = 2;
// 재시도 대기 시간 (ms)
const RETRY_DELAY = 500;

// profiles 테이블에서 최신 display_name을 가져옵니다
// 실패 시 재시도하여 모바일 환경에서도 안정적으로 조회합니다
// 컴포넌트 외부 함수로 분리하여 useCallback/의존성 문제를 방지합니다
async function fetchDisplayName(userId: string): Promise<string | null> {
  const supabase = createClient();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (!error && data) {
        // 조회 성공: display_name 반환 (null일 수 있음)
        return data.display_name;
      }

      console.error(
        `[useAuth] profiles 조회 실패 (시도 ${attempt + 1}/${MAX_RETRIES + 1}):`,
        error?.message
      );

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
      }
    } catch (err) {
      console.error("[useAuth] profiles 조회 예외:", err);
    }
  }

  // 모든 시도 실패 시 null 반환 (user_metadata fallback)
  return null;
}

export function useAuth(): AuthState {
  // 유저 정보 상태
  const [user, setUser] = useState<User | null>(null);
  // 초기 로딩 상태 (true로 시작하여 깜빡임 방지)
  const [isLoading, setIsLoading] = useState(true);
  // profiles 테이블에서 가져온 최신 닉네임
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  // 마운트 여부 추적 (언마운트 후 상태 업데이트 방지)
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();

    // 초기 로딩: 유저 정보 + profiles 테이블을 모두 가져온 후 로딩 해제
    const initialize = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!mountedRef.current) return;
      setUser(currentUser);

      if (currentUser) {
        // profiles 조회가 완료될 때까지 기다린 후 로딩 해제
        const name = await fetchDisplayName(currentUser.id);
        if (mountedRef.current) {
          setProfileDisplayName(name);
        }
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    initialize();

    // 인증 상태 변경을 실시간으로 감지합니다
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // 로그인/토큰 갱신 시 profiles에서 최신 이름 재조회
        const name = await fetchDisplayName(currentUser.id);
        if (mountedRef.current) {
          setProfileDisplayName(name);
        }
      } else {
        // 로그아웃 시 초기화
        setProfileDisplayName(null);
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // 표시 이름: profiles > user_metadata > 이메일 순으로 fallback
  const displayName =
    profileDisplayName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "사용자";

  // 아바타 URL: user_metadata에서 가져옴
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  return {
    user,
    isLoading,
    isLoggedIn: !isLoading && !!user,
    displayName,
    avatarUrl,
  };
}
