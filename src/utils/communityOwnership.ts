// 게시글과 댓글의 작성자를 유효한 회원 번호로 확인한다.
export function isCommunityAuthor(
  user: { memberId?: number } | null | undefined,
  content: { authorId?: number | null } | null | undefined,
): boolean {
  const memberId = user?.memberId;
  return typeof memberId === 'number' && Number.isSafeInteger(memberId) && memberId > 0 &&
    memberId === content?.authorId;
}
