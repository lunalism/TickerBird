// 좋아요 토글 버튼 (낙관적 업데이트)
// 게시글/댓글 모두 재사용 가능하도록 target_type을 prop으로 받습니다.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import type { LikeTargetType } from "@/types/community";

interface LikeButtonProps {
  /** 좋아요 대상 타입 (게시글 또는 댓글) */
  targetType: LikeTargetType;
  /** 좋아요 대상 ID */
  targetId: string;
  /** 초기 좋아요 수 (서버 응답 기반) */
  initialLikeCount: number;
}

interface LikeToggleResponse {
  liked: boolean;
  like_count: number;
}

export default function LikeButton({
  targetType,
  targetId,
  initialLikeCount,
}: LikeButtonProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);

  // 로그인 사용자의 기존 좋아요 여부 조회
  // (좋아요 상태를 알려주는 API가 없어 supabase 브라우저 클라이언트로 직접 조회)
  useEffect(() => {
    if (authLoading || !user) {
      setLiked(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    void supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("좋아요 상태 조회 실패:", error);
          return;
        }
        setLiked(!!data);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, targetType, targetId]);

  // 외부에서 initialLikeCount가 갱신되면 동기화
  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const handleClick = async () => {
    // 비로그인: 로그인 페이지로 이동
    if (!user) {
      router.push("/login");
      return;
    }
    if (isPending) return;

    // 낙관적 업데이트: 즉시 UI 반영
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked
      ? prevCount + 1
      : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setLikeCount(nextCount);
    setIsPending(true);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
        }),
      });

      if (!res.ok) {
        throw new Error("좋아요 처리 실패");
      }

      // 서버 응답으로 최종 상태 동기화
      const data: LikeToggleResponse = await res.json();
      setLiked(data.liked);
      setLikeCount(data.like_count);
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
      // 실패 시 이전 상태로 롤백
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
    >
      <Heart
        aria-hidden="true"
        className={liked ? "fill-current" : ""}
      />
      <span className="tabular-nums">{likeCount}</span>
    </Button>
  );
}
