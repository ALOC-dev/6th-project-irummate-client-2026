function isHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// 외부 페이지 열기. http·https만 연다. 웹은 새 탭(열린 페이지가 원래 창을 조작하지 못하게).
export const externalBrowser = {
  async open(url: string): Promise<void> {
    if (!isHttpUrl(url)) throw new Error('http·https 주소만 열 수 있습니다.');
    window.open(url, '_blank', 'noopener,noreferrer');
  },
};
