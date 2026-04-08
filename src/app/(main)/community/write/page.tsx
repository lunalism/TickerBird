// 커뮤니티 게시글 작성 페이지 (클라이언트 컴포넌트)
// 비로그인 시 /login으로 리다이렉트, 작성 성공 시 새 글 상세로 이동합니다.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PostForm, {
  type PostFormValues,
} from "@/components/community/PostForm";
import type { Post } from "@/types/community";

export default function CommunityWritePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  // 게시글 작성 제출 핸들러
  const handleSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // category는 PostForm에서 받지 않으므로 'free' 기본값으로 전송
        body: JSON.stringify({ ...values, category: "free" }),
      });
      if (!res.ok) {
        const errBody: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "작성 실패");
      }
      const data: { post: Post } = await res.json();
      router.push(`/community/${data.post.id}`);
    } catch (err) {
      console.error("게시글 작성 실패:", err);
      setSubmitError(err instanceof Error ? err.message : "작성 실패");
      setIsSubmitting(false);
    }
  };

  // 인증 로딩 또는 비로그인 상태에서는 폼을 렌더하지 않음 (깜빡임 방지)
  if (authLoading || !isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
        잠시만 기다려주세요...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          새 글 작성
        </h1>
      </header>

      {submitError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
        >
          {submitError}
        </p>
      )}

      <PostForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="등록"
      />
    </div>
  );
}
