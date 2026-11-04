// 토큰 재발급 ②(응답 본문 + 보안 저장소)로 바뀔 때만 앱 구현을 넣는다.
// 웹은 쿠키를 쓰므로 브라우저 저장소로 대체하지 않는다. 지금은 "사용할 수 없음"이다.
export const secureStorage = {
  isAvailable(): boolean {
    return false;
  },
  async get(_key: string): Promise<string | null> {
    return null;
  },
  async set(_key: string, _value: string): Promise<void> {
    throw new Error('보안 저장소를 사용할 수 없는 환경입니다.');
  },
  async remove(_key: string): Promise<void> {},
};
