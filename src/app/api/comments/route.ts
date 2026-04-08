// 커뮤니티 댓글 API Route
// POST: 댓글 작성 (인증 필요)

import { createClient } from "@/lib/supabase/server";
import type { Comment, CreateCommentInput } from "@/types/community";

// POST /api/comments - 댓글 작성
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
  let body: Partial<CreateCommentInput>;
  try {
    body = (await request.json()) as Partial<CreateCommentInput>;
  } catch {
    return Response.json(
      { error: "잘못된 요청 본문입니다" },
      { status: 400 }
    );
  }

  const postId = (body.post_id ?? "").trim();
  const content = (body.content ?? "").trim();
  const parentId = body.parent_id ?? null;

  // 필수 필드 검사
  if (!postId) {
    return Response.json(
      { error: "post_id는 필수입니다" },
      { status: 400 }
    );
  }

  // 본문 길이 검사: 1~300자
  if (content.length < 1 || content.length > 300) {
    return Response.json(
      { error: "댓글은 1자 이상 300자 이하여야 합니다" },
      { status: 400 }
    );
  }

  // 대상 게시글 존재 및 삭제 여부 확인
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, comment_count, is_deleted")
    .eq("id", postId)
    .single();

  if (postError || !post || post.is_deleted) {
    return Response.json(
      { error: "게시글을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  // 대댓글인 경우 부모 댓글 검증 (같은 게시글 + 미삭제)
  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("comments")
      .select("id, post_id, is_deleted")
      .eq("id", parentId)
      .single();

    if (
      parentError ||
      !parent ||
      parent.is_deleted ||
      parent.post_id !== postId
    ) {
      return Response.json(
        { error: "부모 댓글을 찾을 수 없습니다" },
        { status: 404 }
      );
    }
  }

  // 댓글 삽입
  const { data: created, error: insertError } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content,
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("댓글 작성 실패:", insertError);
    return Response.json({ error: "작성 실패" }, { status: 500 });
  }

  // 게시글의 댓글 수 증가 (실패해도 댓글 자체는 생성된 상태이므로 로깅만)
  const { error: countError } = await supabase
    .from("posts")
    .update({ comment_count: post.comment_count + 1 })
    .eq("id", postId);

  if (countError) {
    console.error("댓글 수 증가 실패:", countError);
  }

  return Response.json({ comment: created as Comment }, { status: 201 });
}
