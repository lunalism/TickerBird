// 커뮤니티 좋아요 토글 API Route
// POST: 게시글/댓글 좋아요 토글 (인증 필요)

import { createClient } from "@/lib/supabase/server";
import type { LikeTargetType } from "@/types/community";

/** 좋아요 대상 타입 검증 */
function isLikeTargetType(value: unknown): value is LikeTargetType {
  return value === "post" || value === "comment";
}

// POST /api/likes - 좋아요 토글
export async function POST(request: Request) {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 요청 본문 파싱
  let body: { target_type?: unknown; target_id?: unknown };
  try {
    body = (await request.json()) as {
      target_type?: unknown;
      target_id?: unknown;
    };
  } catch {
    return Response.json(
      { error: "잘못된 요청 본문입니다" },
      { status: 400 }
    );
  }

  // 유효성 검사: target_type
  if (!isLikeTargetType(body.target_type)) {
    return Response.json(
      { error: "target_type은 'post' 또는 'comment'여야 합니다" },
      { status: 400 }
    );
  }
  // 유효성 검사: target_id
  if (typeof body.target_id !== "string" || body.target_id.length === 0) {
    return Response.json(
      { error: "target_id는 필수입니다" },
      { status: 400 }
    );
  }

  const targetType: LikeTargetType = body.target_type;
  const targetId: string = body.target_id;

  // 대상 테이블/카운트 컬럼 결정
  const targetTable = targetType === "post" ? "posts" : "comments";
  const countColumn = "like_count";

  // 대상 존재 및 삭제 여부 확인
  const { data: target, error: targetError } = await supabase
    .from(targetTable)
    .select(`id, ${countColumn}, is_deleted`)
    .eq("id", targetId)
    .single();

  if (targetError || !target || (target as { is_deleted: boolean }).is_deleted) {
    return Response.json(
      { error: "대상을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const currentCount = (target as { like_count: number }).like_count;

  // 기존 좋아요 여부 조회
  const { data: existing, error: existingError } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existingError) {
    console.error("좋아요 조회 실패:", existingError);
    return Response.json({ error: "처리 실패" }, { status: 500 });
  }

  // 토글 처리
  if (existing) {
    // 좋아요 취소: likes DELETE + count - 1
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error("좋아요 취소 실패:", deleteError);
      return Response.json({ error: "처리 실패" }, { status: 500 });
    }

    const nextCount = Math.max(0, currentCount - 1);
    const { error: countError } = await supabase
      .from(targetTable)
      .update({ [countColumn]: nextCount })
      .eq("id", targetId);

    if (countError) {
      console.error("좋아요 카운트 감소 실패:", countError);
    }

    return Response.json({ liked: false, like_count: nextCount });
  }

  // 좋아요 추가: likes INSERT + count + 1
  const { error: insertError } = await supabase.from("likes").insert({
    user_id: user.id,
    target_type: targetType,
    target_id: targetId,
  });

  if (insertError) {
    console.error("좋아요 추가 실패:", insertError);
    return Response.json({ error: "처리 실패" }, { status: 500 });
  }

  const nextCount = currentCount + 1;
  const { error: countError } = await supabase
    .from(targetTable)
    .update({ [countColumn]: nextCount })
    .eq("id", targetId);

  if (countError) {
    console.error("좋아요 카운트 증가 실패:", countError);
  }

  return Response.json({ liked: true, like_count: nextCount });
}
