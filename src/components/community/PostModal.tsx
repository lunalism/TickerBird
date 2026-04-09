// 커뮤니티 게시글 상세 모달
// PostCard 클릭 시 새 페이지 이동 대신 모달로 표시합니다.
// 좋아요/댓글/수정/삭제 동작과 작성자 인라인 수정 폼을 포함합니다.
// (직접 URL 접근은 src/app/(main)/community/[id]/page.tsx가 담당)

"use client";

import { useEffect, useState } from "react";
// isomorphic-dompurify는 SSR/CSR 모두에서 동작하여 동적 import가 불필요합니다.
import DOMPurify from "isomorphic-dompurify";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import LikeButton from "@/components/community/LikeButton";
import CommentSection from "@/components/community/CommentSection";
import PostForm, {
  type PostFormValues,
} from "@/components/community/PostForm";
import type { Post, PostWithAuthor } from "@/types/community";

interface PostModalProps {
  /** 표시할 게시글 (작성자 정보 포함) */
  post: PostWithAuthor;
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 게시글 수정 또는 댓글 카운트 변경 시 부모 목록 동기화용 */
  onPostUpdated?: (post: PostWithAuthor) => void;
  /** 게시글 삭제 성공 시 부모 목록에서 제거하기 위한 콜백 */
  onPostDeleted?: (postId: string) => void;
}

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

export default function PostModal({
  post,
  isOpen,
  onClose,
  onPostUpdated,
  onPostDeleted,
}: PostModalProps) {
  const { user } = useAuth();

  // 모달 내부 게시글 상태 (수정/댓글 카운트 변경 시 즉시 반영)
  const [currentPost, setCurrentPost] = useState<PostWithAuthor>(post);

  // 편집 모드 토글
  const [isEditMode, setIsEditMode] = useState(false);
  // 수정/삭제 진행 상태
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // prop이 바뀌면 내부 상태도 동기화 (다른 게시글 클릭 시)
  useEffect(() => {
    setCurrentPost(post);
    setIsEditMode(false);
    setUpdateError(null);
  }, [post]);

  const isOwner = !!user && user.id === currentPost.user_id;
  const authorName = currentPost.author.display_name?.trim() || "알 수 없음";

  // 댓글 작성/삭제 시 헤더의 comment_count를 즉시 반영 + 부모 목록 동기화
  const handleCommentCountChange = (delta: number) => {
    setCurrentPost((prev) => {
      const updated = {
        ...prev,
        comment_count: Math.max(0, prev.comment_count + delta),
      };
      onPostUpdated?.(updated);
      return updated;
    });
  };

  // 수정 폼 제출 (PATCH /api/posts/[id])
  const handleEditSubmit = async (values: PostFormValues) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/posts/${currentPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errBody: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "수정 실패");
      }
      const data: { post: Post } = await res.json();
      // 응답에는 author 정보가 없으므로 기존 author를 유지
      const updated: PostWithAuthor = {
        ...currentPost,
        ...data.post,
        author: currentPost.author,
      };
      setCurrentPost(updated);
      setIsEditMode(false);
      onPostUpdated?.(updated);
    } catch (err) {
      console.error("게시글 수정 실패:", err);
      setUpdateError(err instanceof Error ? err.message : "수정 실패");
    } finally {
      setIsUpdating(false);
    }
  };

  // 삭제 (DELETE /api/posts/[id])
  const handleDelete = async () => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${currentPost.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errBody: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "삭제 실패");
      }
      onPostDeleted?.(currentPost.id);
      onClose();
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      window.alert(err instanceof Error ? err.message : "삭제 실패");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/*
        모바일: 화면 하단 고정 bottom sheet (rounded-t-xl)
        sm 이상: 중앙 정렬 모달 (max-w-2xl)
        max-h로 뷰포트 초과 시 내부 스크롤
      */}
      <DialogContent
        className="
          left-0 right-auto top-auto bottom-0 max-w-none w-full
          translate-x-0 translate-y-0
          rounded-b-none rounded-t-xl
          max-h-[90vh] overflow-y-auto
          sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto
          sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:rounded-xl sm:max-h-[85vh]
          p-0
        "
      >
        {isEditMode ? (
          // ─── 편집 모드 ───
          <div className="p-5 sm:p-6">
            <DialogTitle className="mb-4 text-lg font-bold text-foreground sm:text-xl">
              게시글 수정
            </DialogTitle>

            {updateError && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              >
                {updateError}
              </p>
            )}

            <PostForm
              initialData={{
                title: currentPost.title,
                content: currentPost.content,
              }}
              onSubmit={handleEditSubmit}
              isSubmitting={isUpdating}
              submitLabel="수정 완료"
              onCancel={() => {
                setIsEditMode(false);
                setUpdateError(null);
              }}
            />
          </div>
        ) : (
          // ─── 상세 보기 모드 ───
          <div className="p-5 sm:p-6">
            {/* 헤더: 제목 + 메타 (작성자/시간/조회수) */}
            <header className="border-b border-border pb-4 pr-8">
              <DialogTitle className="text-xl font-bold text-foreground sm:text-2xl">
                {currentPost.title}
              </DialogTitle>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {authorName}
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={currentPost.created_at}>
                  {formatRelativeTime(currentPost.created_at)}
                </time>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1" title="조회수">
                  <Eye className="size-3.5" aria-hidden="true" />
                  <span className="tabular-nums">{currentPost.view_count}</span>
                </span>
              </div>
            </header>

            {/* 본문 (sanitized HTML 렌더) */}
            <div
              className="prose prose-sm dark:prose-invert mt-5 max-w-none whitespace-pre-wrap break-words text-sm text-foreground"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(currentPost.content),
              }}
            />

            {/* 액션 바: 좋아요 + 댓글수 + (본인) 수정/삭제 */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <LikeButton
                targetType="post"
                targetId={currentPost.id}
                initialLikeCount={currentPost.like_count}
              />
              <span
                className="inline-flex items-center gap-1 text-sm text-muted-foreground"
                title="댓글 수"
              >
                <MessageSquare className="size-4" aria-hidden="true" />
                <span className="tabular-nums">
                  {currentPost.comment_count}
                </span>
              </span>

              {/* 본인 게시글: 수정/삭제 */}
              {isOwner && (
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                    aria-label="게시글 수정"
                  >
                    <Pencil aria-hidden="true" />
                    <span>수정</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    aria-label="게시글 삭제"
                  >
                    <Trash2 aria-hidden="true" />
                    <span>{isDeleting ? "삭제 중..." : "삭제"}</span>
                  </Button>
                </div>
              )}
            </div>

            {/* 댓글 섹션 */}
            <CommentSection
              postId={currentPost.id}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
