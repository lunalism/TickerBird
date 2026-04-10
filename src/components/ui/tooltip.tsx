// shadcn 스타일 Tooltip wrapper
// base-ui (@base-ui/react/tooltip) 프리미티브를 감싸 4개 컴포넌트로 export 합니다.
// (button.tsx와 동일한 방식 — 프로젝트가 base-ui 기반)
//
// 사용 예:
//   <TooltipProvider>
//     <Tooltip>
//       <TooltipTrigger render={<span>hover me</span>} />
//       <TooltipContent>설명 텍스트</TooltipContent>
//     </Tooltip>
//   </TooltipProvider>

"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

/** 전역 Provider — 지연 시간 등 글로벌 옵션을 설정합니다. */
const TooltipProvider = TooltipPrimitive.Provider;

/** 단일 Tooltip Root */
const Tooltip = TooltipPrimitive.Root;

/** Tooltip 호버 대상. render prop으로 children element 전달을 권장합니다. */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Tooltip 본문 컨테이너.
 * Portal + Positioner + Popup을 결합해 한 컴포넌트로 사용 가능합니다.
 *
 * - sideOffset: 트리거와의 간격 (기본 8px)
 * - 최대 너비 300px, 텍스트 자동 줄바꿈 허용
 * - 다크모드 대응 (popover 토큰 사용)
 */
function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & {
  /** 트리거와 팝업 사이 간격 (px) */
  sideOffset?: number;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          className={cn(
            // 기본 스타일 (배경/테두리/그림자/타이포)
            "z-50 max-w-[300px] rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
            // 긴 영문/한글 혼합 컨텐츠도 자연스럽게 줄바꿈
            "whitespace-normal break-words",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent };
