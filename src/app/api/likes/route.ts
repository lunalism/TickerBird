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

  // 대상 존재 및 삭제 여부 확인 (404 보장)
  const targetTable = targetType === "post" ? "posts" : "comments";
  const { data: target, error: targetError } = await supabase
    .from(targetTable)
    .select("id, is_deleted")
    .eq("id", targetId)
    .single();

  if (
    targetError ||
    !target ||
    (target as { is_deleted: boolean }).is_deleted
  ) {
    return Response.json(
      { error: "대상을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  // 좋아요 토글을 RPC 원자적 함수로 처리 (race condition 방지)
  // 반환 형태: { liked: boolean, like_count: number }
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "toggle_like",
    {
      p_user_id: user.id,
      p_target_type: targetType,
      p_target_id: targetId,
    }
  );

  if (rpcError || !rpcResult) {
    console.error("좋아요 토글 실패:", rpcError);
    return Response.json({ error: "처리 실패" }, { status: 500 });
  }

  return Response.json(
    rpcResult as { liked: boolean; like_count: number }
  );
}
