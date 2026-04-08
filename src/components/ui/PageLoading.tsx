// 페이지 콘텐츠 영역 전체 로딩 스피너
// Next.js loading.tsx에서 사용하는 공통 컴포넌트입니다.

export default function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      {/* 원형 스피너 */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">불러오는 중...</p>
    </div>
  );
}
