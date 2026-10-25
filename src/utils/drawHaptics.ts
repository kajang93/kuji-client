// 쿠지 선택과 개봉에 기기별로 짧고 절제된 촉각 피드백을 제공한다.
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

type DrawHaptic = "select" | "pull" | "open" | "reveal";
const pulses: Record<DrawHaptic, number | number[]> = {
  select: 8,
  pull: 6,
  open: 16,
  reveal: [10, 35, 14],
};
let lastPulseAt = -Infinity;
let nativePending = false;

export function playDrawHaptic(kind: DrawHaptic): void {
  if (typeof window === "undefined" || document.hidden ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const now = performance.now();
  if (now - lastPulseAt < 110 || nativePending) return;
  lastPulseAt = now;

  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Haptics")) {
    nativePending = true;
    void Haptics.impact({ style: ImpactStyle.Light })
      .catch(() => {})
      .finally(() => { nativePending = false; });
  } else if (typeof navigator.vibrate === "function") {
    try { navigator.vibrate(pulses[kind]); } catch { /* 미지원 기기는 시각 효과로 계속 진행한다. */ }
  }
}

export function stopDrawHaptics(): void {
  lastPulseAt = -Infinity;
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(0); } catch { /* 종료 시 진동 미지원 오류는 무시한다. */ }
  }
}
