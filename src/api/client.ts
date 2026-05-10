/**
 * API 공통 헤더 및 통신 설정
 */

export const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // 여기에 공통으로 추가하고 싶은 헤더를 넣으세요!
    // 예: "Accept-Language": "ko-KR",
  };
};

/**
 * 필요하다면 공통 fetch 래퍼 함수를 여기에 만들 수 있습니다.
 */
