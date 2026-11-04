import { expect, test } from '@playwright/test';

// 스모크: 주소의 세션 시나리오에 따라 가드가 각각 로그인·가입 단계·홈으로 보낸다.
const cases = [
  { query: '?session=anonymous', path: '/login', screenId: 'ON-01' },
  { query: '?session=onboarding&stage=intro', path: '/onboarding/intro', screenId: 'ON-03' },
  { query: '?session=certified', path: '/home', screenId: 'HM-01' },
];

for (const { query, path, screenId } of cases) {
  test(`${query} → ${path}`, async ({ page }) => {
    await page.goto(`/${query}`);
    await expect(page.getByRole('heading', { name: new RegExp(`^${screenId} `) })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  });
}
