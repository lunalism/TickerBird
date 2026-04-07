// 관리자 패널 페이지 (서버 컴포넌트 래퍼)

import type { Metadata } from "next";
import AdminPageClient from "./AdminPageClient";

// 관리자 페이지 탭 제목
export const metadata: Metadata = {
  title: "관리자 패널",
};

export default function AdminPage() {
  return <AdminPageClient />;
}
