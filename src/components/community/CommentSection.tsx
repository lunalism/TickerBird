// 게시글 댓글 섹션
// 댓글 목록 조회 + 작성 + 삭제(soft delete) 기능을 제공합니다.

"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { CommentWithAuthor } from "@/types/community";

interface CommentSectionProps {
  /** 게시글 ID */
  postId: string;
  /**
   * 댓글 작성/삭제로 댓글 수가 변경되었을 때 호출되는 콜백
   * delta: 작성 시 +1, 삭제 시 -1
   * 부모 컴포넌트가 게시글 헤더의 comment_count를 동기화하는 용도로 사용합니다.
   */
  onCommentCountChange?: (delta: number) => void;
}

/** 댓글 본문 최대 길이 */
const MAX_CONTENT_LENGTH = 300;

/** 한국어 상대 시간 포맷 */
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function CommentSection({
  postId,
  onCommentCountChange,
}: CommentSectionProps) {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inputContent, setInputContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 댓글 목록 조회
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("댓글을 불러오지 못했습니다");
      const data: { comments: CommentWithAuthor[] } = await res.json();
      setComments(data.comments);
    } catch (err) {
      console.error("댓글 조회 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 댓글 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputContent.trim();
    if (content.length < 1 || content.length > MAX_CONTENT_LENGTH) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content }),
      });
      if (!res.ok) {
        const errBody: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "댓글 작성 실패");
      }
      // 작성 성공 → 입력창 초기화 + 목록 갱신 + 부모 카운트 +1 통지
      setInputContent("");
      await fetchComments();
      onCommentCountChange?.(1);
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      setSubmitError(
        err instanceof Error ? err.message : "댓글 작성 실패"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 삭제 (본인만)
  const handleDelete = async (commentId: string) => {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errBody: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "댓글 삭제 실패");
      }
      // 삭제 성공 → 목록 갱신 + 부모 카운트 -1 통지
      await fetchComments();
      onCommentCountChange?.(-1);
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      window.alert(err instanceof Error ? err.message : "댓글 삭제 실패");
    }
  };

  const inputLength = inputContent.length;
  const isInputValid =
    inputLength > 0 && inputLength <= MAX_CONTENT_LENGTH && !isSubmitting;

  return (
    <section
      aria-labelledby="comment-heading"
      className="mt-8 border-t border-border pt-6"
    >
      <h2
        id="comment-heading"
        className="mb-4 text-base font-semibold text-foreground"
      >
        댓글 {comments.length}
      </h2>

      {/* 입력창 (로그인 시에만) */}
      {!authLoading && isLoggedIn && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="rounded-lg border border-border bg-card p-3">
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              rows={3}
              placeholder="댓글을 입력하세요"
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="댓글 입력"
            />
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-xs tabular-nums ${
                  inputLength > MAX_CONTENT_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
                aria-live="polite"
              >
                {inputLength} / {MAX_CONTENT_LENGTH}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={!isInputValid}
                aria-label="댓글 등록"
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </Button>
            </div>
          </div>
          {submitError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {submitError}
            </p>
          )}
        </form>
      )}

      {/* 비로그인 안내 */}
      {!authLoading && !isLoggedIn && (
        <p className="mb-6 rounded-lg border border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      {/* 목록: 로딩 / 에러 / 빈 / 정상 */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border bg-card p-3"
            >
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="mt-2 h-3 w-full rounded bg-muted" />
              <div className="mt-1 h-3 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive"
        >
          {error}
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          아직 댓글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const isOwner = !!user && user.id === comment.user_id;
            const authorName =
              comment.author.display_name?.trim() || "알 수 없음";
            return (
              <li
                key={comment.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {authorName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={comment.created_at}>
                      {formatRelativeTime(comment.created_at)}
                    </time>
                  </div>
                  {isOwner && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(comment.id)}
                      aria-label="댓글 삭제"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap break-words text-foreground">
                  {comment.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
