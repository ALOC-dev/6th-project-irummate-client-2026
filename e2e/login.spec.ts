import { expect, test } from '@playwright/test';

// MSW 개발 모드: 카카오 버튼을 누르면 카카오에 가지 않고 가짜 코드로 콜백 화면을 거쳐 첫 화면으로 간다.
// state 대조, 코드 교환, 로그인 완료, 단계 판정, 히스토리 대체 이동까지 실제 코드로 지난다.
test('비로그인 → 카카오 로그인 → 홈', async ({ page }) => {
  await page.goto('/?session=anonymous');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole('button', { name: '카카오 로그인' }).click();

  await expect(page.getByRole('heading', { name: /^HM-01 / })).toBeVisible();
  await expect(page).toHaveURL(/\/home$/);

  // 콜백 화면은 히스토리에서 대체되어, 뒤로가기로 콜백(일회용 코드)을 다시 열지 않는다.
  await page.goBack();
  await expect(page).not.toHaveURL(/\/oauth\/kakao\/callback/);
});
