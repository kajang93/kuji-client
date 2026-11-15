// 나이스페이먼츠 결제창(Server 승인 모델) 호출.
// 카드 인증이 끝나면 나이스가 서버의 /api/payments/nice/return 으로 결과를 POST 하고,
// 서버는 서명을 확인한 뒤 앱의 결제 복귀 화면(/payment/return 또는 /?pointCharge=)으로 돌려보낸다.
// 실제 승인은 그 화면에서 로그인한 사용자의 확인 요청으로 서버가 처리한다.
import { API_HOST } from '../api/client';

const SDK_URL = 'https://pay.nicepay.co.kr/v1/js/';

type NiceRequest = {
  clientId: string;
  method: 'card';
  orderId: string;
  amount: number;
  goodsName: string;
  returnUrl: string;
  mallReserved?: string;
  appScheme?: string;
  fnError: (result: { errorMsg?: string; resultCode?: string }) => void;
};

declare global {
  interface Window { AUTHNICE?: { requestPay: (request: NiceRequest) => void } }
}

let loading: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (window.AUTHNICE) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => (window.AUTHNICE ? resolve() : reject(new Error('결제창을 불러오지 못했습니다.')));
      script.onerror = () => { loading = null; script.remove(); reject(new Error('결제창을 불러오지 못했습니다. 네트워크를 확인해 주세요.')); };
      document.head.appendChild(script);
    });
  }
  return loading;
}

export function getNiceClientId(): string | undefined {
  const value = import.meta.env.VITE_NICE_CLIENT_ID as string | undefined;
  return value && value.trim() ? value.trim() : undefined;
}

/**
 * 결제창을 띄운다. 사용자가 창을 닫거나 오류가 나면 reject 되고, 정상 진행되면 페이지가 나이스 화면으로 이동한다.
 * kind 는 서버가 돌려보낼 화면(쿠지 개봉 / 포인트 충전)을 정한다.
 */
export async function requestNicePayment(params: { kind: 'kuji' | 'points'; orderId: string; amount: number; goodsName: string }): Promise<void> {
  const clientId = getNiceClientId();
  if (!clientId) throw new Error('결제 서비스가 설정되지 않았습니다. 고객센터에 문의해 주세요.');
  await loadSdk();
  const origin = API_HOST || window.location.origin;
  await new Promise<void>((_resolve, reject) => {
    window.AUTHNICE!.requestPay({
      clientId,
      method: 'card',
      orderId: params.orderId,
      amount: params.amount,
      // 상품명에 큰따옴표·파이프가 있으면 나이스가 바꿔 버리므로 미리 정리하고 40자 이내로 자른다.
      goodsName: params.goodsName.replace(/["|¦]/g, '-').slice(0, 40),
      returnUrl: `${origin}/api/payments/nice/return`,
      mallReserved: params.kind,
      fnError: result => {
        const message = result?.errorMsg || '결제가 취소되었습니다.';
        const error = new Error(message) as Error & { code?: string };
        // 사용자가 결제창을 닫은 경우는 오류 안내 없이 조용히 돌아간다.
        if (message.includes('취소')) error.code = 'USER_CANCEL';
        reject(error);
      },
    });
  });
}
