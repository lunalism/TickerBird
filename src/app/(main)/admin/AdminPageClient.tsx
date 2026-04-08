// 관리자 대시보드 클라이언트 컴포넌트
// 상단 통계 카드 4개 + 메뉴 카드 4개를 표시합니다.
// 비관리자 접근 시 /news로 리다이렉트합니다.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Users,
  FileText,
  BarChart3,
  Ban,
  Newspaper,
  Crown,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// 통계 데이터 타입
interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  trumpPosts: number;
  premiumUsers: number;
  todaySignups: number;
}

export default function AdminPageClient() {
  const router = useRouter();
  const { isLoading, isLoggedIn, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [latestCollect, setLatestCollect] = useState<string>("");
  const [latestUser, setLatestUser] = useState<string>("");

  // 비로그인 또는 비관리자 접근 시 /news로 리다이렉트
  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.replace("/news");
    }
  }, [isLoading, isLoggedIn, isAdmin, router]);

  // 대시보드 데이터 조회
  useEffect(() => {
    if (!isAdmin) return;

    const fetchDashboard = async () => {
      try {
        // 통계 API 조회
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            totalUsers: data.totalUsers,
            totalArticles: data.totalArticles,
            trumpPosts: data.trumpPosts,
            premiumUsers: data.premiumUsers,
            todaySignups: data.todaySignups,
          });
        }

        // 차단 언론사 수 조회
        const blockedRes = await fetch("/api/admin/blocked-sources");
        if (blockedRes.ok) {
          const data = await blockedRes.json();
          setBlockedCount(data.sources?.length ?? 0);
        }

        // 최근 가입 유저 조회
        const usersRes = await fetch("/api/admin/users?page=1");
        if (usersRes.ok) {
          const data = await usersRes.json();
          if (data.users?.length > 0) {
            setLatestUser(data.users[0].display_name || data.users[0].email);
          }
        }

        // 마지막 뉴스 수집 시간 조회 (클라이언트 Supabase)
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: latestArticle } = await supabase
          .from("articles")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestArticle) {
          setLatestCollect(latestArticle.created_at);
        }
      } catch (error) {
        console.error("대시보드 데이터 조회 실패:", error);
      }
    };

    fetchDashboard();
  }, [isAdmin]);

  // 로딩 중 스피너
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 비관리자 (리다이렉트 전 잠깐 표시)
  if (!isAdmin) {
    return null;
  }

  // 상대 시간 포맷
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}분 전`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}시간 전`;
    return `${Math.floor(hour / 24)}일 전`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-xl font-bold text-foreground">
        🛡️ 관리자 패널
      </h1>

      {/* ── 상단 통계 카드 4개 ── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
        {/* 총 유저수 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-2">
            <Users size={16} className="text-sky-500" />
            <span className="text-xs text-muted-foreground">총 유저수</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalUsers ?? "-"}
          </p>
        </div>

        {/* 수집된 뉴스 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-2">
            <Newspaper size={16} className="text-emerald-500" />
            <span className="text-xs text-muted-foreground">수집된 뉴스</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalArticles ?? "-"}
          </p>
        </div>

        {/* 트럼프 게시물 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-500" />
            <span className="text-xs text-muted-foreground">트럼프 게시물</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.trumpPosts ?? "-"}
          </p>
        </div>

        {/* Premium 유저 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-2">
            <Crown size={16} className="text-amber-500" />
            <span className="text-xs text-muted-foreground">Premium 유저</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.premiumUsers ?? "-"}
          </p>
        </div>
      </div>

      {/* ── 메뉴 카드 4개 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 통계 */}
        <Link
          href="/admin/stats"
          className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 size={20} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">📊 통계</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            오늘 가입자: {stats?.todaySignups ?? 0}명
          </p>
        </Link>

        {/* 사용자 관리 */}
        <Link
          href="/admin/users"
          className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <Users size={20} className="text-sky-500" />
            <h3 className="text-sm font-semibold text-foreground">
              👥 사용자 관리
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            최근 가입: {latestUser || "-"}
          </p>
        </Link>

        {/* 콘텐츠 관리 */}
        <Link
          href="/admin/content"
          className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <FileText size={20} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">
              📰 콘텐츠 관리
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            마지막 수집: {formatTime(latestCollect)}
          </p>
        </Link>

        {/* 차단 언론사 관리 */}
        <Link
          href="/admin/blocked-sources"
          className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <Ban size={20} className="text-red-500" />
            <h3 className="text-sm font-semibold text-foreground">
              🚫 차단 언론사 관리
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            현재 차단: {blockedCount}개
          </p>
        </Link>
      </div>
    </div>
  );
}
