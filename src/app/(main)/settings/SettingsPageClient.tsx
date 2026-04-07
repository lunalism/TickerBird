// 설정 페이지 클라이언트 컴포넌트
// 다크모드 토글 등 앱 설정을 관리합니다.

"use client";

import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

export default function SettingsPageClient() {
  // 전역 상태에서 다크모드 상태를 가져옵니다
  const { isDarkMode, toggleDarkMode } = useUIStore();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-xl font-bold text-foreground">설정</h1>

      {/* ── 테마 설정 섹션 ── */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          테마 설정
        </h3>

        {/* 다크모드 토글 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 현재 모드에 따라 아이콘 표시 */}
            {isDarkMode ? (
              <Moon size={20} className="text-muted-foreground" />
            ) : (
              <Sun size={20} className="text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                다크 모드
              </p>
              <p className="text-xs text-muted-foreground">
                {isDarkMode
                  ? "현재 다크 모드가 적용되어 있습니다"
                  : "현재 라이트 모드가 적용되어 있습니다"}
              </p>
            </div>
          </div>

          {/* 토글 스위치 */}
          <button
            onClick={toggleDarkMode}
            className={`
              relative h-6 w-11 rounded-full transition-colors duration-200
              ${isDarkMode ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}
            `}
            aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {/* 토글 원형 슬라이더 */}
            <span
              className={`
                absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200
                ${isDarkMode ? "translate-x-5" : "translate-x-0.5"}
              `}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
