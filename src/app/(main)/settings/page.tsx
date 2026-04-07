// 설정 페이지 (서버 컴포넌트 래퍼)

import type { Metadata } from "next";
import SettingsPageClient from "./SettingsPageClient";

// 설정 페이지 탭 제목
export const metadata: Metadata = {
  title: "설정",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
