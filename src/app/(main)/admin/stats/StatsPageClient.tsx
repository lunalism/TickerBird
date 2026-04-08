// 관리자 통계 페이지 클라이언트 컴포넌트
// 유저, 기사, 소스별 통계를 카드로 표시합니다.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// 통계 데이터 타입
interface Stats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  todaySignups: number;
  totalArticles: number;
  krArticles: number;
  usArticles: number;
  trumpPosts: number;
  sourceStats: Record<string, number>;
}

export default function StatsPageClient() {
  const router = useRouter();
  const { isLoading: isAuthLoading, isLoggedIn, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 비관리자 리다이렉트
  useEffect(() => {
    if (!isAuthLoading && (!isLoggedIn || !isAdmin)) {
      router.replace("/news");
    }
  }, [isAuthLoading, isLoggedIn, isAdmin, router]);

  // 통계 데이터 조회
  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (error) {
        console.error("통계 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (isAuthLoading || !isAdmin) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 통계 카드 렌더링 헬퍼
  const StatCard = ({
    label,
    value,
  }: {
    label: string;
    value: number | string;
  }) => (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">
        {isLoading ? "-" : value}
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 + 제목 */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          관리자 패널
        </Link>
        <h1 className="text-xl font-bold text-foreground">📊 통계</h1>
      </div>

      {/* 유저 통계 */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          유저 통계
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="총 유저수" value={stats?.totalUsers ?? 0} />
          <StatCard label="Premium 유저" value={stats?.premiumUsers ?? 0} />
          <StatCard label="무료 유저" value={stats?.freeUsers ?? 0} />
          <StatCard label="오늘 가입자" value={stats?.todaySignups ?? 0} />
        </div>
      </section>

      {/* 콘텐츠 통계 */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          콘텐츠 통계
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="총 뉴스 기사" value={stats?.totalArticles ?? 0} />
          <StatCard label="🇰🇷 한국 뉴스" value={stats?.krArticles ?? 0} />
          <StatCard label="🇺🇸 미국 뉴스" value={stats?.usArticles ?? 0} />
          <StatCard label="트럼프 게시물" value={stats?.trumpPosts ?? 0} />
        </div>
      </section>

      {/* 소스별 기사수 */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          소스별 기사수
        </h2>
        <div className="space-y-3">
          {stats?.sourceStats &&
            Object.entries(stats.sourceStats)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => {
                const max = Math.max(
                  ...Object.values(stats.sourceStats),
                  1
                );
                const percent = Math.round((count / max) * 100);
                return (
                  <div key={source}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {source}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count}개
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/60 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
}
