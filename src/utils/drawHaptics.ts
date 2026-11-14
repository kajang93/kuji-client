// 쿠지 선택·절취선 뜯기·개봉·등급 공개에 기기별로 세기가 다른 촉각 피드백을 제공한다.
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

type DrawHaptic = "select" | "pull" | "open" | "reveal";
const feedback: Record<DrawHaptic, { style: ImpactStyle; strength: number; pulse: number | number[] }> = {
  select: { style: ImpactStyle.Light, strength: 1, pulse: 8 },
  pull: { style: ImpactStyle.Medium, strength: 2, pulse: [14, 20, 20] },
  open: { style: ImpactStyle.Heavy, strength: 3, pulse: [30, 24, 45] },
  reveal: { style: ImpactStyle.Heavy, strength: 3, pulse: [45, 45, 18] },
};

// 절취선 구멍 하나를 뜯을 때의 '톡' 세기 (뒤로 갈수록 강해진다)
export type TearLevel = 1 | 2 | 3;
const TEAR_STYLE: Record<TearLevel, ImpactStyle> = { 1: ImpactStyle.Light, 2: ImpactStyle.Medium, 3: ImpactStyle.Heavy };
const TEAR_PULSE: Record<TearLevel, number> = { 1: 6, 2: 12, 3: 22 };

// 등급별 공개 진동: 높은 등급일수록 길고 강하게
type RevealPattern = { native: Array<{ at: number; style: ImpactStyle }>; success: boolean; web: number[] };
const STRONG: RevealPattern = {
  native: [{ at: 0, style: ImpactStyle.Heavy }, { at: 110, style: ImpactStyle.Heavy }, { at: 260, style: ImpactStyle.Medium }, { at: 420, style: ImpactStyle.Heavy }],
  success: true,
  web: [70, 40, 70, 40, 160],
};
const MEDIUM: RevealPattern = {
  native: [{ at: 0, style: ImpactStyle.Heavy }, { at: 150, style: ImpactStyle.Medium }],
  success: false,
  web: [45, 35, 70],
};
const LIGHT: RevealPattern = { native: [{ at: 0, style: ImpactStyle.Medium }], success: false, web: [35] };

let lastPulseAt = -Infinity;
let lastStrength = 0;
let lastTickAt = -Infinity;
const pendingTimers = new Set<number>();

function canPlayHaptic(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined" && !document.hidden &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

const isNative = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Haptics");
const canVibrate = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

// iOS Safari(웹)는 진동 API가 없다. iOS 18부터 스위치형 체크박스를 누르면 시스템 햅틱이 한 번 울리는
// 동작을 이용해 세기 조절 없는 짧은 '톡'만 대체 제공한다. 앱(Capacitor)에서는 네이티브 햅틱을 쓴다.
let iosSwitchLabel: HTMLLabelElement | null = null;
function iosWebTick(): void {
  if (typeof document === "undefined" || canVibrate() || isNative()) return;
  if (!/iP(hone|ad|od)/.test(navigator.userAgent) && !(navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1)) return;
  try {
    if (!iosSwitchLabel || !iosSwitchLabel.isConnected) {
      const label = document.createElement("label");
      label.setAttribute("aria-hidden", "true");
      label.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:0";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
      iosSwitchLabel = label;
    }
    iosSwitchLabel.click();
  } catch {
    // 지원하지 않는 브라우저에서는 조용히 넘어간다.
  }
}

function schedule(fn: () => void, delay: number): void {
  if (delay <= 0) { fn(); return; }
  const timer = window.setTimeout(() => { pendingTimers.delete(timer); if (canPlayHaptic()) fn(); }, delay);
  pendingTimers.add(timer);
}

export function playDrawHaptic(kind: DrawHaptic): void {
  if (!canPlayHaptic()) return;
  const now = performance.now();
  const { style, strength, pulse } = feedback[kind];
  if (now - lastPulseAt < 90 && strength <= lastStrength) return;
  lastPulseAt = now;
  lastStrength = strength;

  try {
    if (isNative()) {
      // 네이티브 단발 충격은 예약하지 않아 취소 뒤 뒤늦게 재생되는 진동을 만들지 않는다.
      void Haptics.impact({ style }).catch(() => undefined);
    } else if (canVibrate()) {
      // 웹 API는 세기 대신 지속 시간과 간격으로 단계의 차이를 표현한다.
      navigator.vibrate(pulse);
    } else {
      iosWebTick();
    }
  } catch {
    // 진동을 지원하지 않는 환경에서도 개봉 동작은 계속한다.
  }
}

/** 절취선 구멍을 하나 뜯을 때마다 호출한다. level 이 클수록 강하다. */
export function playTearTick(level: TearLevel): void {
  if (!canPlayHaptic()) return;
  const now = performance.now();
  if (now - lastTickAt < 45) return;
  lastTickAt = now;
  try {
    if (isNative()) void Haptics.impact({ style: TEAR_STYLE[level] }).catch(() => undefined);
    else if (canVibrate()) navigator.vibrate(TEAR_PULSE[level]);
    else if (level >= 2) iosWebTick();
  } catch {
    // 무시
  }
}

/** 등급 공개 순간의 진동. A·S·라스트상은 길고 강하게, B는 중간, 그 외는 짧게. */
export function playRevealHaptic(rank: string): void {
  if (!canPlayHaptic()) return;
  const normalized = (rank || "").toUpperCase();
  const pattern = normalized === "A" || normalized === "S" || normalized === "LAST" ? STRONG : normalized === "B" ? MEDIUM : LIGHT;
  lastPulseAt = performance.now();
  lastStrength = 3;
  try {
    if (isNative()) {
      if (pattern.success) void Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
      pattern.native.forEach(({ at, style }) => schedule(() => void Haptics.impact({ style }).catch(() => undefined), at + (pattern.success ? 120 : 0)));
    } else if (canVibrate()) {
      navigator.vibrate(pattern.web);
    } else {
      iosWebTick();
      if (pattern !== LIGHT) schedule(iosWebTick, 160);
    }
  } catch {
    // 무시
  }
}

export function stopDrawHaptics(): void {
  lastPulseAt = -Infinity;
  lastStrength = 0;
  lastTickAt = -Infinity;
  pendingTimers.forEach(timer => window.clearTimeout(timer));
  pendingTimers.clear();
  if (canVibrate()) {
    try { navigator.vibrate(0); } catch { /* 종료 시 진동 미지원 오류는 무시한다. */ }
  }
}
