// 내 정보 페이지 클라이언트 컴포넌트
// 프로필 정보 표시, 닉네임 변경, 로그아웃 기능을 제공합니다.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Pencil, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

// 프로필 테이블 데이터 타입
interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  tier: string;
  created_at: string;
}

export default function ProfilePageClient() {
  const router = useRouter();
  // Supabase 인증 상태
  const { user, isLoading: isAuthLoading, isLoggedIn } = useAuth();

  // 프로필 데이터 상태
  const [profile, setProfile] = useState<Profile | null>(null);
  // 프로필 로딩 상태
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 닉네임 편집 상태
  const [isEditingName, setIsEditingName] = useState(false);
  // 편집 중인 닉네임 값
  const [editName, setEditName] = useState("");
  // 닉네임 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);
  // 로그아웃 처리 중 상태
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // 토스트 메시지 상태
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  // 아바타 이미지 로드 실패 상태
  const [avatarError, setAvatarError] = useState(false);
  // 닉네임 유효성 검사 에러 메시지
  const [nameError, setNameError] = useState("");
  // 닉네임 중복 체크 상태: "idle" | "checking" | "available" | "duplicate"
  const [dupStatus, setDupStatus] = useState<"idle" | "checking" | "available" | "duplicate">("idle");
  // debounce 타이머 ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 비로그인 시 /login으로 리다이렉트
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  // 프로필 데이터를 Supabase에서 가져옵니다
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, tier, created_at")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
        // profiles 테이블에 데이터가 없으면 auth 메타데이터로 대체
        setProfile({
          display_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null,
          avatar_url: user.user_metadata?.avatar_url || null,
          tier: "free",
          created_at: user.created_at,
        });
      }
      setIsProfileLoading(false);
    };

    fetchProfile();
  }, [user]);

  // 표시용 이름 (프로필 > 메타데이터 > 이메일 순서로 fallback)
  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "사용자";

  // 표시용 아바타 URL (avatar_url > picture > 빈 문자열 순으로 fallback)
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  // 구독 등급 표시 텍스트
  const tierLabel = profile?.tier === "premium" ? "Premium" : "Free";

  // 가입일 포맷
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // 토스트 메시지 표시 (3초 후 자동 사라짐)
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 닉네임 허용 패턴 (한글, 영문, 숫자, 언더스코어만)
  const NAME_PATTERN = /^[가-힣a-zA-Z0-9_]+$/;

  // 닉네임 유효성 검사 (실시간)
  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "닉네임을 입력해주세요";
    if (trimmed.length < 2) return "닉네임은 2글자 이상이어야 합니다";
    if (trimmed.length > 16) return "닉네임은 16글자 이하여야 합니다";
    if (!NAME_PATTERN.test(trimmed))
      return "한글, 영문, 숫자, _ 만 사용할 수 있습니다";
    return "";
  };

  // 저장 버튼 활성화 여부 (에러 없고, 현재 닉네임과 다르고, 중복 아닐 때)
  const isNameValid =
    !nameError &&
    editName.trim() !== "" &&
    editName.trim() !== displayName &&
    dupStatus === "available";

  // Supabase에서 닉네임 중복 여부를 확인합니다 (본인 제외)
  const checkDuplicate = useCallback(
    async (name: string) => {
      if (!user) return;
      setDupStatus("checking");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("display_name", name)
        .neq("id", user.id)
        .limit(1);

      if (error) {
        console.error("닉네임 중복 체크 실패:", error);
        // 에러 시 사용 가능으로 처리 (저장 시 다시 검증됨)
        setDupStatus("available");
        return;
      }

      setDupStatus(data && data.length > 0 ? "duplicate" : "available");
    },
    [user]
  );

  // 닉네임 입력값 변경 핸들러 (실시간 유효성 검사 + debounce 중복 체크)
  const handleNameChange = (value: string) => {
    setEditName(value);
    const error = validateName(value);
    setNameError(error);

    // 기존 debounce 타이머 해제
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 유효성 검사 통과 + 현재 닉네임과 다를 때만 중복 체크
    const trimmed = value.trim();
    if (!error && trimmed && trimmed !== displayName) {
      setDupStatus("checking");
      // 500ms debounce 후 중복 체크 실행
      debounceRef.current = setTimeout(() => {
        checkDuplicate(trimmed);
      }, 500);
    } else {
      // 유효하지 않거나 현재와 같으면 중복 체크 초기화
      setDupStatus("idle");
    }
  };

  // 컴포넌트 언마운트 시 debounce 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // 닉네임 편집 시작
  const handleEditStart = () => {
    setEditName(displayName);
    setNameError("");
    setDupStatus("idle");
    setIsEditingName(true);
  };

  // 닉네임 저장
  // 1) auth user_metadata 업데이트 (사이드바 등 즉시 반영)
  // 2) profiles 테이블 upsert (DB 영속 저장)
  const handleEditSave = async () => {
    if (!user || !isNameValid) return;
    setIsSaving(true);

    const trimmedName = editName.trim();
    const supabase = createClient();

    // 1단계: Supabase Auth user_metadata에 닉네임 저장
    // → onAuthStateChange가 트리거되어 사이드바도 즉시 반영됩니다
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: trimmedName, name: trimmedName },
    });

    if (authError) {
      console.error("닉네임 auth 메타데이터 업데이트 실패:", authError);
      showToast("닉네임 변경에 실패했습니다", "error");
      setIsSaving(false);
      setIsEditingName(false);
      return;
    }

    // 2단계: profiles 테이블에도 저장 (영속 데이터)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, display_name: trimmedName },
        { onConflict: "id" }
      );

    if (profileError) {
      // profiles 테이블 저장 실패는 경고만 (auth 업데이트는 성공했으므로)
      console.error("닉네임 profiles 테이블 저장 실패:", profileError);
    }

    // 로컬 상태 업데이트 + 성공 토스트
    setProfile((prev) =>
      prev ? { ...prev, display_name: trimmedName } : prev
    );
    showToast("닉네임이 변경되었습니다", "success");

    setIsSaving(false);
    setIsEditingName(false);
  };

  // 닉네임 편집 취소
  const handleEditCancel = () => {
    setIsEditingName(false);
    setEditName("");
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // 로딩 중 스피너 표시
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 비로그인 상태 (리다이렉트 전 잠깐 표시)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-xl font-bold text-foreground">내 정보</h1>

      {/* ── 프로필 섹션 ── */}
      <section className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          {/* 아바타 이미지 (Google 프로필 사진, 실패 시 이니셜 폴백) */}
          {avatarUrl && !avatarError ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={72}
              height={72}
              className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            // 기본 아바타 (이니셜) — 이미지 없거나 로드 실패 시
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
              {displayName.charAt(0)}
            </div>
          )}

          {/* 프로필 정보 */}
          <div className="flex-1 space-y-3">
            {/* 닉네임 (인라인 편집) */}
            <div className="flex items-center gap-2">
              {isEditingName ? (
                // 편집 모드: 입력 필드 + 에러 메시지 + 저장/취소 버튼
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      maxLength={17}
                      className={`rounded-md border bg-background px-2 py-1 text-lg font-semibold text-foreground outline-none focus:ring-2 ${
                        nameError
                          ? "border-red-500 focus:ring-red-300"
                          : "border-border focus:ring-ring"
                      }`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isNameValid) handleEditSave();
                        if (e.key === "Escape") handleEditCancel();
                      }}
                    />
                    {/* 저장 버튼 (유효하지 않으면 비활성화) */}
                    <button
                      onClick={handleEditSave}
                      disabled={isSaving || !isNameValid}
                      className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-emerald-950/30"
                      aria-label="저장"
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                      aria-label="취소"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {/* 유효성 검사 에러 메시지 */}
                  {nameError && (
                    <p className="text-xs text-red-500">{nameError}</p>
                  )}
                  {/* 닉네임 중복 체크 상태 메시지 */}
                  {!nameError && dupStatus === "checking" && (
                    <p className="text-xs text-muted-foreground">확인 중...</p>
                  )}
                  {!nameError && dupStatus === "duplicate" && (
                    <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다</p>
                  )}
                  {!nameError && dupStatus === "available" && editName.trim() !== displayName && (
                    <p className="text-xs text-emerald-600">사용 가능한 닉네임입니다</p>
                  )}
                </div>
              ) : (
                // 표시 모드: 닉네임 + 편집 버튼
                <>
                  <h2 className="text-lg font-semibold text-foreground">
                    {displayName}
                  </h2>
                  <button
                    onClick={handleEditStart}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="닉네임 수정"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
            </div>

            {/* 이메일 */}
            <p className="text-sm text-muted-foreground">{user?.email}</p>

            {/* 가입일 + 구독 등급 */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* 가입일 */}
              <span className="text-muted-foreground">
                가입일: {createdAt}
              </span>
              {/* 구독 등급 배지 */}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile?.tier === "premium"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {tierLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 계정 설정 섹션 ── */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          계정 설정
        </h3>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {isLoggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          <span>{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
        </button>
      </section>

      {/* ── 토스트 알림 ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
