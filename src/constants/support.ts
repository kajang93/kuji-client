// 고객센터 / 관리자 문의 채널 설정
//
// ⚠️ 실제 카카오톡 채널 주소로 이 값 하나만 바꾸면 앱 전체(설정·사업자 프로필·승인 대기 화면)에 반영됩니다.
//    형식: http://pf.kakao.com/_채널ID/chat  (채널 관리자센터 > 채널정보 > 채널 URL 에서 확인)
export const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_xxxxxxx/chat";

// 카카오톡 채널 문의 열기 (공통 핸들러)
export const openKakaoChannel = () => {
  window.open(KAKAO_CHANNEL_URL, "_blank");
};
