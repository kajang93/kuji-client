// 포트원 V2 결제창 호출.
// 결제 ID는 서버가 만든 주문번호를 그대로 쓴다. 결제가 끝나면 기존 결제 복귀 화면(/payment/return, /?pointCharge=)으로
// 돌아가고, 그 화면에서 로그인한 사용자의 확인 요청을 받아 서버가 포트원에 결제를 직접 조회·검증한다.
import * as PortOne from '@portone/browser-sdk/v2';

// 상점 ID와 채널 키는 결제창에 그대로 노출되는 공개 값이다. 실결제 채널로 바꿀 때는 배포 비밀값으로 덮어쓴다.
const STORE_ID = (import.meta.env.VITE_PORTONE_STORE_ID as string | undefined)?.trim() || 'store-5aa93057-fbd5-4899-85b8-79b660c2747a';
const CHANNEL_KEY = (import.meta.env.VITE_PORTONE_CHANNEL_KEY as string | undefined)?.trim() || 'channel-key-563d8886-224b-42cf-ba32-6cfa24cd4f59';

export function isPaymentConfigured(): boolean {
  return Boolean(STORE_ID && CHANNEL_KEY);
}

type PaymentKind = 'kuji' | 'points';

function returnUrl(kind: PaymentKind, orderId: string, amount: number): string {
  const url = new URL(kind === 'kuji' ? '/payment/return' : '/', window.location.origin);
  url.searchParams.set(kind === 'kuji' ? 'payment' : 'pointCharge', 'success');
  url.searchParams.set('orderId', orderId);
  url.searchParams.set('paymentKey', orderId);
  url.searchParams.set('amount', String(amount));
  return url.toString();
}

/**
 * 결제창을 띄운다.
 * - 모바일: 결제 후 redirectUrl 로 이동하며, 실패·취소면 포트원이 code·message 쿼리를 붙인다.
 * - PC: 결과를 프로미스로 받으므로 성공 시 같은 복귀 주소로 직접 이동한다.
 * 사용자가 창을 닫으면 code 가 USER_CANCEL 인 오류로 reject 된다.
 */
export async function requestPortOnePayment(params: { kind: PaymentKind; orderId: string; amount: number; goodsName: string }): Promise<void> {
  const redirectUrl = returnUrl(params.kind, params.orderId, params.amount);
  const response = await PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey: CHANNEL_KEY,
    paymentId: params.orderId,
    orderName: params.goodsName.slice(0, 40),
    totalAmount: params.amount,
    currency: 'KRW',
    payMethod: 'CARD',
    redirectUrl,
  });
  if (!response) return; // 모바일은 이미 redirectUrl 로 이동 중
  if (response.code !== undefined) {
    const message = response.message || '결제가 취소되었습니다.';
    const error = new Error(message) as Error & { code?: string };
    if (/취소|cancel/i.test(message)) error.code = 'USER_CANCEL';
    throw error;
  }
  window.location.href = redirectUrl;
}
