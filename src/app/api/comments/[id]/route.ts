// 커뮤니티 댓글 상세 API Route
// PATCH: 댓글 수정 (본인만)
// DELETE: 댓글 삭제 (본인 또는 관리자, 소프트 삭제)

import { createClient } from "@/lib/supabase/server";
import { verifyAdmin } from "@/lib/auth";
import type { Comment } from "@/types/community";

// PATCH /api/comments/[id] - 댓글 수정 (본인만)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 요청 본문 파싱
  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return Response.json(
      { error: "잘못된 요청 본문입니다" },
      { status: 400 }
    );
  }

  const content = (body.content ?? "").trim();

  // 본문 길이 검사: 1~300자
  if (content.length < 1 || content.length > 300) {
    return Response.json(
      { error: "댓글은 1자 이상 300자 이하여야 합니다" },
      { status: 400 }
    );
  }

  // 댓글 존재 및 작성자/삭제 여부 확인
  const { data: existing, error: fetchError } = await supabase
    .from("comments")
    .select("user_id, is_deleted")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return Response.json(
      { error: "댓글을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  // 삭제된 댓글은 수정 불가
  if (existing.is_deleted) {
    return Response.json(
      { error: "삭제된 댓글은 수정할 수 없습니다" },
      { status: 400 }
    );
  }

  // 본인 댓글만 수정 가능
  if (existing.user_id !== user.id) {
    return Response.json({ error: "수정 권한이 없습니다" }, { status: 403 });
  }

  // 댓글 업데이트
  const { data: updated, error: updateError } = await supabase
    .from("comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("댓글 수정 실패:", updateError);
    return Response.json({ error: "수정 실패" }, { status: 500 });
  }

  return Response.json({ comment: updated as Comment });
}

// DELETE /api/comments/[id] - 댓글 삭제 (본인 또는 관리자, 소프트 삭제)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 댓글 존재 확인
  const { data: existing, error: fetchError } = await supabase
    .from("comments")
    .select("user_id, post_id, is_deleted")
    .eq("id", id)
    .single();

  if (fetchError || !existing || existing.is_deleted) {
    return Response.json(
      { error: "댓글을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  // 본인이 아니면 관리자 권한 확인
  if (existing.user_id !== user.id) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return Response.json(
        { error: "삭제 권한이 없습니다" },
        { status: 403 }
      );
    }
  }

  // 소프트 삭제
  const { error: deleteError } = await supabase
    .from("comments")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (deleteError) {
    console.error("댓글 삭제 실패:", deleteError);
    return Response.json({ error: "삭제 실패" }, { status: 500 });
  }

  // 게시글의 댓글 수 감소 (현재 값 조회 후 -1, 0 미만 방지)
  const { data: post } = await supabase
    .from("posts")
    .select("comment_count")
    .eq("id", existing.post_id)
    .single();

  if (post) {
    const nextCount = Math.max(0, post.comment_count - 1);
    const { error: countError } = await supabase
      .from("posts")
      .update({ comment_count: nextCount })
      .eq("id", existing.post_id);

    if (countError) {
      console.error("댓글 수 감소 실패:", countError);
    }
  }

  return Response.json({ success: true });
}
