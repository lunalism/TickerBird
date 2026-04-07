// 뉴스 모달 래퍼 컴포넌트
// 오버레이 + 모달 박스 + ESC 키 닫기를 처리합니다.

"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface NewsModalProps {
  children: React.ReactNode;
}

export default function NewsModal({ children }: NewsModalProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    // 배경 스크롤 방지
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 반투명 오버레이 - 클릭 시 닫힘 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* 모달 박스 */}
      <div className="relative z-10 mx-4 max-h-[85vh] w-full max-w-[600px] overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}
