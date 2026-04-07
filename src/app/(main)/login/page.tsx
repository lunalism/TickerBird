// 로그인 페이지 (서버 컴포넌트 래퍼)
// (main) 그룹 안에 위치하여 데스크탑에서는 사이드바와 함께 표시됩니다.

import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

// 로그인 페이지 탭 제목
export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
