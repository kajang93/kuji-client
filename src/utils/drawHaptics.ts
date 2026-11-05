// 쿠지 선택과 개봉에 기기별로 짧고 절제된 촉각 피드백을 제공한다.
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

type DrawHaptic = "select" | "pull" | "open" | "reveal";
const feedback: Record<DrawHaptic, { style: ImpactStyle; strength: number; pulse: number | number[] }> = {
  select: { style: ImpactStyle.Light, strength: 1, pulse: 8 },
  pull: { style: ImpactStyle.Medium, strength: 2, pulse: [14, 20, 20] },
  open: { style: ImpactStyle.Heavy, strength: 3, pulse: [30, 24, 45] },
  reveal: { style: ImpactStyle.Heavy, strength: 3, pulse: [45, 45, 18] },
};
let lastPulseAt = -Infinity;
let lastStrength = 0;

function canPlayHaptic(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined" && !document.hidden &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function playDrawHaptic(kind: DrawHaptic): void {
  if (!canPlayHaptic()) return;
  const now = performance.now();
  const { style, strength, pulse } = feedback[kind];
  if (now - lastPulseAt < 90 && strength <= lastStrength) return;
  lastPulseAt = now;
  lastStrength = strength;

  try {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Haptics")) {
      // 네이티브 단발 충격은 예약하지 않아 취소 뒤 뒤늦게 재생되는 진동을 만들지 않는다.
      void Haptics.impact({ style }).catch(() => undefined);
    } else if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      // 웹 API는 세기 대신 지속 시간과 간격으로 단계의 차이를 표현한다.
      navigator.vibrate(pulse);
    }
  } catch {
    // 진동을 지원하지 않는 환경에서도 개봉 동작은 계속한다.
  }
}

export function stopDrawHaptics(): void {
  lastPulseAt = -Infinity;
  lastStrength = 0;
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(0); } catch { /* 종료 시 진동 미지원 오류는 무시한다. */ }
  }
}
