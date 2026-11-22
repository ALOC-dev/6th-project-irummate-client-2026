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

// 2단계 완료 기준: 로그인 → (접근 토큰이 없는 새로 고침) 재발급 → 로그아웃
test('로그인 → 새로 고침해도 로그인 유지 → 로그아웃 → 로그인 화면', async ({ page }) => {
  await page.goto('/?session=anonymous');
  await page.getByRole('button', { name: '카카오 로그인' }).click();
  await expect(page.getByRole('heading', { name: /^HM-01 / })).toBeVisible();

  // 새로 고침하면 메모리의 접근 토큰이 사라지고, 시작 시 재발급으로 다시 로그인 상태가 된다.
  await page.goto('/my');
  await expect(page.getByRole('heading', { name: /^MY-01 / })).toBeVisible();

  await page.getByRole('button', { name: '로그아웃' }).click();

  await expect(page.getByRole('heading', { name: /^ON-01 / })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);

  // 로그아웃 뒤에는 새로 고침해도 재발급되지 않는다.
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});

test('로그인 전에 연 화면으로 로그인 후 돌아간다', async ({ page }) => {
  await page.goto('/match?session=anonymous');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole('button', { name: '카카오 로그인' }).click();

  await expect(page.getByRole('heading', { name: /^MC-01 / })).toBeVisible();
  // 가려던 주소를 쿼리까지 그대로 기억한다(여기서는 MSW 시나리오 쿼리가 붙어 있음).
  await expect(page).toHaveURL(/\/match(\?|$)/);
});
