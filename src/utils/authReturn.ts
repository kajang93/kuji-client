// 로그인 전 선택한 상품 번호와 일반 티켓 수량을 현재 탭에서 잠시 보관한다.
export type AuthReturnContext = { boardId: number; count: number; expiresAt: number };
type ReturnStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const AUTH_RETURN_KEY = 'kuji_auth_return';
const AUTH_RETURN_TTL = 30 * 60 * 1000;
const positiveInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export function parseBoardId(value: string | null): number | null {
  if (!value || !/^[1-9][0-9]*$/.test(value)) return null;
  const boardId = Number(value);
  return positiveInteger(boardId) ? boardId : null;
}

export function readAuthReturn(storage: ReturnStorage = sessionStorage, now = Date.now()): AuthReturnContext | null {
  try {
    const value = JSON.parse(storage.getItem(AUTH_RETURN_KEY) || 'null');
    if (!value || !positiveInteger(value.boardId) || !positiveInteger(value.count)
        || value.count > 2147483647 || !Number.isSafeInteger(value.expiresAt)
        || value.expiresAt <= now || value.expiresAt > now + AUTH_RETURN_TTL) return null;
    return { boardId: value.boardId, count: value.count, expiresAt: value.expiresAt };
  } catch {
    return null;
  }
}

export function saveAuthReturn(boardId: number, count: number, storage: ReturnStorage = sessionStorage, now = Date.now()): AuthReturnContext {
  if (!positiveInteger(boardId) || !positiveInteger(count) || count > 2147483647) throw new Error('돌아갈 상품 정보를 확인할 수 없습니다.');
  const context = { boardId, count, expiresAt: now + AUTH_RETURN_TTL };
  storage.setItem(AUTH_RETURN_KEY, JSON.stringify(context));
  return context;
}

export function clearAuthReturn(expected?: AuthReturnContext, storage: ReturnStorage = sessionStorage): void {
  try {
    if (expected) {
      const current = readAuthReturn(storage);
      if (!current || current.boardId !== expected.boardId || current.count !== expected.count || current.expiresAt !== expected.expiresAt) return;
    }
    storage.removeItem(AUTH_RETURN_KEY);
  } catch {
    // 저장소 접근이 차단되어도 로그인이나 상품 조회를 중단하지 않는다.
  }
}
