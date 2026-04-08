// 공용 게시글 작성/수정 폼 컴포넌트
// 제목/본문 입력 + 글자수 카운터 + 유효성 검사를 제공합니다.
// 작성/수정 페이지가 동일한 UI를 공유하기 위해 onSubmit을 prop으로 받습니다.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** PostForm이 부모로 전달하는 입력 값 */
export interface PostFormValues {
  title: string;
  content: string;
}

interface PostFormProps {
  /** 수정 시 기존 값 (없으면 빈 폼) */
  initialData?: PostFormValues;
  /** 제출 핸들러 (검증 통과한 trim된 값 전달) */
  onSubmit: (values: PostFormValues) => void | Promise<void>;
  /** 제출 진행 중 여부 (버튼 비활성화 및 라벨 변경에 사용) */
  isSubmitting: boolean;
  /** 제출 버튼 라벨 (기본: "등록") */
  submitLabel?: string;
}

/** 제목 최대 길이 */
const MAX_TITLE_LENGTH = 100;
/** 본문 최대 길이 */
const MAX_CONTENT_LENGTH = 500;

export default function PostForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "등록",
}: PostFormProps) {
  const router = useRouter();
  // initialData는 마운트 시점에만 사용 (수정 페이지는 데이터 로딩 후에만 PostForm을 렌더하므로
  // 비동기 동기화를 위한 useEffect가 필요 없습니다.)
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const titleLength = title.length;
  const contentLength = content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // 클라이언트 사이드 검증 (서버 검증과 동일 기준)
    if (trimmedTitle.length < 1 || trimmedTitle.length > MAX_TITLE_LENGTH) {
      setValidationError(
        `제목은 1자 이상 ${MAX_TITLE_LENGTH}자 이하여야 합니다`
      );
      return;
    }
    if (
      trimmedContent.length < 1 ||
      trimmedContent.length > MAX_CONTENT_LENGTH
    ) {
      setValidationError(
        `본문은 1자 이상 ${MAX_CONTENT_LENGTH}자 이하여야 합니다`
      );
      return;
    }

    setValidationError(null);
    await onSubmit({ title: trimmedTitle, content: trimmedContent });
  };

  // 취소 버튼: 이전 페이지로 이동 (없으면 /community)
  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/community");
    }
  };

  const titleOver = titleLength > MAX_TITLE_LENGTH;
  const contentOver = contentLength > MAX_CONTENT_LENGTH;
  const canSubmit =
    !isSubmitting &&
    titleLength > 0 &&
    contentLength > 0 &&
    !titleOver &&
    !contentOver;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 제목 입력 */}
      <div>
        <label
          htmlFor="post-title"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          제목
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="제목을 입력하세요"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          aria-invalid={titleOver}
        />
        <div className="mt-1 flex justify-end">
          <span
            className={`text-[11px] tabular-nums ${
              titleOver ? "text-destructive" : "text-muted-foreground"
            }`}
            aria-live="polite"
          >
            {titleLength} / {MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* 본문 입력 */}
      <div>
        <label
          htmlFor="post-content"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          본문
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_CONTENT_LENGTH}
          rows={10}
          placeholder="내용을 입력하세요"
          className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          aria-invalid={contentOver}
        />
        <div className="mt-1 flex justify-end">
          <span
            className={`text-[11px] tabular-nums ${
              contentOver ? "text-destructive" : "text-muted-foreground"
            }`}
            aria-live="polite"
          >
            {contentLength} / {MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      {/* 검증 에러 메시지 */}
      {validationError && (
        <p role="alert" className="text-xs text-destructive">
          {validationError}
        </p>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" variant="default" size="default" disabled={!canSubmit}>
          {isSubmitting ? "처리 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
