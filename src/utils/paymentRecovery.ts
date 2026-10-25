// 결제 콜백을 검증하고 새로고침 후 복구할 정보를 현재 탭에 보관한다.
export type PaymentKind = "kuji" | "points";
export type PaymentStatus = "PENDING" | "COMPLETED" | "RECOVERING" | "CANCELLED" | "FAILED";

export interface PendingPaymentRecovery {
  kind: PaymentKind;
  orderId: string;
  amount?: number;
  paymentKey?: string;
  boardId?: number;
  count?: number;
}

type PaymentStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const RECOVERY_KEY = "payment_recovery";
const pendingKey = (kind: PaymentKind) => kind === "kuji" ? "kuji_pending_payment" : "point_charge_pending";
const isPositiveInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
const validOrder = (kind: PaymentKind, orderId: unknown): orderId is string =>
  typeof orderId === "string" && /^[A-Za-z0-9_-]{6,64}$/.test(orderId) &&
  orderId.startsWith(kind === "kuji" ? "KUJI-" : "CHARGE-");

export function readPaymentRecovery(storage: PaymentStorage = sessionStorage): PendingPaymentRecovery | null {
  try {
    const value = JSON.parse(storage.getItem(RECOVERY_KEY) || "null");
    if (!value || !["kuji", "points"].includes(value.kind) || !validOrder(value.kind, value.orderId)) return null;
    if (value.amount !== undefined && !isPositiveInteger(value.amount)) return null;
    if (value.paymentKey !== undefined && (typeof value.paymentKey !== "string" || !value.paymentKey || value.paymentKey.length > 200)) return null;
    if (value.boardId !== undefined && !isPositiveInteger(value.boardId)) return null;
    if (value.count !== undefined && !isPositiveInteger(value.count)) return null;
    return value;
  } catch {
    return null;
  }
}

export function savePaymentReturn(
  kind: PaymentKind,
  orderId: string,
  callback?: { paymentKey: string; amount: string },
  preparedStorage: PaymentStorage = localStorage,
  recoveryStorage: PaymentStorage = sessionStorage,
): PendingPaymentRecovery {
  if (!validOrder(kind, orderId)) throw new Error("주문 번호를 확인할 수 없습니다.");
  const previous = readPaymentRecovery(recoveryStorage);
  if (previous && previous.orderId !== orderId) throw new Error("확인이 끝나지 않은 이전 결제가 있습니다.");
  const prepared = JSON.parse(preparedStorage.getItem(pendingKey(kind)) || "null");
  if (prepared && prepared.orderId !== orderId) throw new Error("결제 대기 정보와 주문 번호가 다릅니다.");
  const amount = callback ? Number(callback.amount) : previous?.amount ?? prepared?.amount;
  if (callback && (!callback.paymentKey || callback.paymentKey.length > 200 || !isPositiveInteger(amount))) throw new Error("결제 응답을 확인할 수 없습니다.");
  if (prepared?.amount !== undefined && callback && prepared.amount !== amount) throw new Error("결제 금액이 주문 정보와 다릅니다.");
  if (previous?.paymentKey && callback && previous.paymentKey !== callback.paymentKey) throw new Error("기존 결제 응답과 일치하지 않습니다.");
  const recovery: PendingPaymentRecovery = {
    kind,
    orderId,
    ...(isPositiveInteger(amount) ? { amount } : {}),
    ...(callback?.paymentKey || previous?.paymentKey ? { paymentKey: callback?.paymentKey || previous?.paymentKey } : {}),
    ...(kind === "kuji" && isPositiveInteger(prepared?.boardId ?? previous?.boardId) ? { boardId: prepared?.boardId ?? previous?.boardId } : {}),
    ...(kind === "kuji" && isPositiveInteger(prepared?.count ?? previous?.count) ? { count: prepared?.count ?? previous?.count } : {}),
  };
  recoveryStorage.setItem(RECOVERY_KEY, JSON.stringify(recovery));
  return recovery;
}

export async function resolvePaymentRecovery<T>(
  payment: PendingPaymentRecovery,
  services: {
    getStatus: (orderId: string) => Promise<PaymentStatus>;
    confirm: (payment: PendingPaymentRecovery & { paymentKey: string; amount: number }) => Promise<T>;
  },
): Promise<{ status: PaymentStatus; result?: T }> {
  const status = await services.getStatus(payment.orderId);
  if (status !== "PENDING" || !payment.paymentKey || !payment.amount ||
    (payment.kind === "kuji" && (!payment.boardId || !payment.count))) return { status };
  try {
    return { status: "COMPLETED", result: await services.confirm({ ...payment, paymentKey: payment.paymentKey, amount: payment.amount }) };
  } catch {
    // 응답 유실과 처리 실패를 구분하기 위해 원래 주문의 상태를 다시 조회한다.
    return { status: await services.getStatus(payment.orderId) };
  }
}

export function clearPaymentRecovery(
  payment: PendingPaymentRecovery,
  preparedStorage: PaymentStorage = localStorage,
  recoveryStorage: PaymentStorage = sessionStorage,
): void {
  if (readPaymentRecovery(recoveryStorage)?.orderId === payment.orderId) recoveryStorage.removeItem(RECOVERY_KEY);
  try {
    if (JSON.parse(preparedStorage.getItem(pendingKey(payment.kind)) || "null")?.orderId === payment.orderId) {
      preparedStorage.removeItem(pendingKey(payment.kind));
    }
  } catch {
    // 다른 주문이나 읽을 수 없는 대기 정보는 임의로 지우지 않는다.
  }
}
