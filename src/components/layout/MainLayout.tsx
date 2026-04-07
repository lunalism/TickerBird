// 메인 레이아웃 컴포넌트
// 데스크탑: 왼쪽 사이드바 + 오른쪽 메인 콘텐츠
// 모바일: 상단 헤더 + 메인 콘텐츠 + 하단 탭바

"use client";

import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { useUIStore } from "@/stores/uiStore";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // 사이드바 열림 상태를 전역 스토어에서 가져옵니다
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="flex min-h-screen">
      {/* 데스크탑 전용: 왼쪽 사이드바 (md 이상) */}
      <Sidebar />

      {/* 모바일 전용: 상단 헤더 (md 미만) */}
      <MobileHeader />

      {/* 메인 콘텐츠 영역 */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          pt-14 pb-16 md:pt-0 md:pb-0
          ${isSidebarOpen ? "md:ml-60" : "md:ml-16"}
        `}
      >
        {children}
      </main>

      {/* 모바일 전용: 하단 탭바 (md 미만) */}
      <MobileTabBar />
    </div>
  );
}
