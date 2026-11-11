// 직접 식별정보 없이 가입 단계 발생 건수를 중복 요청과 구분해 집계한다.
import { API_HOST } from '../api/client';

export type FunnelEvent = 'LANDING_VIEW' | 'VIEW_ITEM_LIST' | 'VIEW_ITEM' | 'AUTH_VIEW' | 'SIGNUP_VIEW' | 'SIGNUP_START' | 'SMS_SEND_ACCEPTED' | 'PHONE_VERIFIED' | 'SIGNUP_SUBMITTED' | 'SIGNUP_COMPLETED' | 'LOGIN_COMPLETED' | 'AUTH_RETURNED_ITEM' | 'VALIDATION_FAILED';
type Context = { audience?: 'customer' | 'business'; method?: 'email' | 'kakao' | 'naver' | 'google' | 'none' };
const sources = ['direct', 'threads', 'kakao', 'naver', 'google', 'other'] as const;
const SOURCE_KEY = 'kuji_funnel_source';
const RECEIPTS_KEY = 'kuji_funnel_receipts';
const pending = new Set<string>();

export function trackFunnelEvent(event: FunnelEvent, context: Context = {}): void {
  try {
    if (typeof window === 'undefined' || typeof crypto.randomUUID !== 'function') return;
    const incoming = new URLSearchParams(window.location.search).get('utm_source')?.toLowerCase();
    if (incoming) sessionStorage.setItem(SOURCE_KEY, sources.includes(incoming as typeof sources[number]) ? incoming : 'other');
    const saved = sessionStorage.getItem(SOURCE_KEY);
    const source = sources.includes(saved as typeof sources[number]) ? saved : 'direct';
    const audience = context.audience || 'customer';
    const method = context.method || 'none';
    const device = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
    const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
    const key = [day, event, source, audience, method, device].join('|');
    const existing = JSON.parse(sessionStorage.getItem(RECEIPTS_KEY) || '{}');
    const receipts: Record<string, { id: string; sent: boolean }> = Object.fromEntries(Object.entries(existing).filter(([k]) => k.startsWith(day + '|'))) as typeof existing;
    if (receipts[key]?.sent || pending.has(key)) return;
    const requestId = receipts[key]?.id || crypto.randomUUID();
    receipts[key] = { id: requestId, sent: false };
    sessionStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    pending.add(key);
    // 로그인 헤더·쿠키·전체 경로·리퍼러·입력값을 첨부하지 않는다.
    void fetch(`${API_HOST}/api/analytics/funnel`, {
      method: 'POST', credentials: 'omit', keepalive: true, referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, event, source, audience, method, device }),
    }).then(response => {
      if (!response.ok) return;
      const latest = JSON.parse(sessionStorage.getItem(RECEIPTS_KEY) || '{}');
      if (latest[key]?.id === requestId) {
        latest[key].sent = true;
        sessionStorage.setItem(RECEIPTS_KEY, JSON.stringify(latest));
      }
    }).catch(() => undefined).finally(() => pending.delete(key));
  } catch {
    // 통계 수집 실패와 브라우저 저장소 제한은 가입·결제 동작에 영향을 주지 않는다.
  }
}
