// 뉴스 레이아웃
// @modal parallel route slot을 받아서 뉴스 리스트 위에 렌더링합니다.

export default function NewsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
