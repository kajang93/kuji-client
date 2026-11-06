// 공개 브로셔와 같은 오시쿠지 고객센터 채널을 공통으로 사용한다.
export const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_sdvGX/chat";

// 카카오톡 채널 문의 열기 (공통 핸들러)
export const openKakaoChannel = () => {
  window.open(KAKAO_CHANNEL_URL, "_blank");
};
