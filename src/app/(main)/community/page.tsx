// 커뮤니티 게시글 목록 페이지 (클라이언트 컴포넌트)
// /api/posts에서 페이지네이션된 게시글을 가져와 카드 리스트로 표시합니다.

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/community/PostCard";
import PostListSkeleton from "@/components/community/PostListSkeleton";
import InlinePostForm from "@/components/community/InlinePostForm";
import PostModal from "@/components/community/PostModal";
import type { PostWithAuthor } from "@/types/community";

/** 한 페이지 당 게시글 수 */
const PAGE_SIZE = 20;

/** /api/posts 응답 형태 */
interface PostsResponse {
  posts: PostWithAuthor[];
  total: number;
  page: number;
}

export default function CommunityPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달에 표시 중인 게시글 (null이면 모달 닫힘)
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);

  // 게시글 목록 조회
  const fetchPosts = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/posts?page=${targetPage}&limit=${PAGE_SIZE}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("게시글을 불러오지 못했습니다");
      }
      const data: PostsResponse = await res.json();
      setPosts(data.posts);
      setTotal(data.total);
    } catch (err) {
      console.error("커뮤니티 목록 조회 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 페이지 변경 시 재조회
  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  // 인라인 폼에서 글 작성 성공 시: 1페이지로 이동 후 목록 갱신
  // (현재 페이지가 1이면 fetchPosts만 재호출)
  const handlePostCreated = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchPosts(1);
    }
  };

  // 모달에서 게시글 수정/댓글 카운트 변경 시: 목록의 해당 게시글 동기화
  const handlePostUpdated = (updated: PostWithAuthor) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    // 모달 내부 상태도 동일 객체로 유지
    setSelectedPost(updated);
  };

  // 모달에서 게시글 삭제 성공 시: 목록에서 제거 + 총 개수 감소
  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      {/* 헤더: 타이틀만 (글쓰기 버튼은 인라인 폼으로 대체) */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          커뮤니티
        </h1>
      </header>

      {/* 인라인 작성 폼 (로그인 상태일 때만) / 비로그인 안내 */}
      {!authLoading && isLoggedIn && (
        <InlinePostForm onSuccess={handlePostCreated} />
      )}
      {!authLoading && !isLoggedIn && (
        <p className="mb-6 rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
          하고 첫 글을 작성해보세요.
        </p>
      )}

      {/* 본문: 로딩 / 에러 / 빈 상태 / 목록 */}
      {isLoading ? (
        <PostListSkeleton />
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fetchPosts(page)}
          >
            다시 시도
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 게시글이 없습니다.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
            />
          ))}
        </ul>
      )}

      {/* 페이지네이션 (목록이 있을 때만) */}
      {!isLoading && !error && posts.length > 0 && (
        <nav
          className="mt-6 flex items-center justify-center gap-2"
          aria-label="페이지네이션"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="이전 페이지"
          >
            <ChevronLeft aria-hidden="true" />
            <span>이전</span>
          </Button>
          <span
            className="min-w-[5rem] text-center text-sm tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="다음 페이지"
          >
            <span>다음</span>
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}

      {/* 게시글 상세 모달 */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
}
