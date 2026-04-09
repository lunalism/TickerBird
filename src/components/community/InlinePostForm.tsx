// 트위터/쓰레드 스타일 인라인 게시글 작성 폼
// 기본은 접힌 상태(제목 1줄)이며, 포커스 시 본문 textarea가 펼쳐집니다.
// 등록 성공 후 폼을 초기화하고 다시 접힌 상태로 복귀합니다.

"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types/community";

interface InlinePostFormProps {
  /** 작성 성공 시 호출되는 콜백 (목록 갱신용) */
  onSuccess?: (post: Post) => void;
}

/** 제목 최대 길이 */
const MAX_TITLE_LENGTH = 100;
/** 본문 최대 길이 */
const MAX_CONTENT_LENGTH = 500;

export default function InlinePostForm({ onSuccess }: InlinePostFormProps) {
  const { displayName, avatarUrl } = useAuth();

  // 펼침/접힘 상태 (기본: 접힘)
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 아바타 이미지 로드 실패 상태
  const [avatarError, setAvatarError] = useState(false);

  const titleLength = title.length;
  const contentLength = content.length;
  const titleOver = titleLength > MAX_TITLE_LENGTH;
  const contentOver = contentLength > MAX_CONTENT_LENGTH;

  // 제출 가능 여부 (제목/본문 모두 공백 아닌 1자 이상, 길이 초과 없음)
  const canSubmit =
    !isSubmitting &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    !titleOver &&
    !contentOver;

  // 폼 초기화 + 접힌 상태로 복귀
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSubmitError(null);
    setIsExpanded(false);
  };

  // 취소 버튼: 입력값 비우고 접힘
  const handleCancel = () => {
    resetForm();
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 카테고리는 인라인 폼에서 받지 않으므로 'free' 기본값으로 전송
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: "free",
        }),
      });

      if (!res.ok) {
        const errBody: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "작성 실패");
      }

      const data: { post: Post } = await res.json();
      // 성공 시 폼 초기화 + 부모에 알림
      resetForm();
      onSuccess?.(data.post);
    } catch (err) {
      console.error("게시글 작성 실패:", err);
      setSubmitError(err instanceof Error ? err.message : "작성 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-border bg-card p-4"
    >
      {/* 상단: 아바타 + 제목 입력 */}
      <div className="flex items-start gap-3">
        {/* 아바타 (이미지 실패 시 기본 아이콘 폴백) */}
        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-accent">
          {avatarUrl && !avatarError ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-accent-foreground">
              <User className="size-5" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* 제목 입력 — 클릭/포커스 시 본문 펼침 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="무슨 이야기를 나누고 싶나요?"
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          aria-label="게시글 제목"
          aria-invalid={titleOver}
        />
      </div>

      {/* 펼쳐졌을 때만 본문/카운터/액션 표시 */}
      {isExpanded && (
        <div className="mt-3 space-y-3 pl-[52px]">
          {/* 본문 textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={4}
            placeholder="내용을 입력하세요"
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="게시글 본문"
            aria-invalid={contentOver}
            autoFocus
          />

          {/* 글자수 카운터 (제목/본문) */}
          <div className="flex items-center justify-end gap-3 text-[11px] tabular-nums">
            <span
              className={
                titleOver ? "text-destructive" : "text-muted-foreground"
              }
              aria-live="polite"
            >
              제목 {titleLength} / {MAX_TITLE_LENGTH}
            </span>
            <span
              className={
                contentOver ? "text-destructive" : "text-muted-foreground"
              }
              aria-live="polite"
            >
              본문 {contentLength} / {MAX_CONTENT_LENGTH}
            </span>
          </div>

          {/* 에러 메시지 */}
          {submitError && (
            <p role="alert" className="text-xs text-destructive">
              {submitError}
            </p>
          )}

          {/* 액션 버튼: 취소 + 등록 */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!canSubmit}
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
