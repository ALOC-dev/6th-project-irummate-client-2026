// 사진 1장 선택. 앱은 나중에 사진 플러그인 경로를 파일 객체로 바꿔 돌려준다.
// 웹은 숨겨진 파일 선택 입력을 쓰고, 취소하면 null이다.
export const photoPicker = {
  pickOne(accept = 'image/*'): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
      input.addEventListener('cancel', () => resolve(null), { once: true });
      input.click();
    });
  },
};
