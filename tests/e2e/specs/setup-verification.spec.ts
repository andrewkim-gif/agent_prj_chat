import { test, expect } from '@playwright/test';

/**
 * Setup verification test
 * 이 테스트는 E2E 환경이 올바르게 설정되었는지 확인합니다.
 */

test.describe('E2E Setup Verification', () => {
  test('homepage loads successfully @smoke @setup', async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/ARA/);

    // 기본 요소들이 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();

    // 네비게이션이 있는지 확인 (가능한 경우)
    const navigation = page.locator('nav, header, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }

    console.log('✅ Homepage loaded successfully');
  });

  test('chat page navigation works @smoke @setup', async ({ page }) => {
    // 홈페이지에서 시작
    await page.goto('/');

    // 채팅 페이지로 이동
    await page.goto('/chat');

    // URL이 올바른지 확인
    await expect(page).toHaveURL(/.*\/chat/);

    // 페이지가 로드되었는지 확인
    await expect(page.locator('body')).toBeVisible();

    console.log('✅ Chat page navigation works');
  });

  test('environment variables are properly set @setup', async ({ page }) => {
    // 브라우저에서 환경 정보 확인
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const viewport = page.viewportSize();

    console.log('Browser:', userAgent);
    console.log('Viewport:', viewport);

    expect(viewport).toBeTruthy();
    expect(userAgent).toBeTruthy();

    console.log('✅ Environment variables are accessible');
  });

  test('basic network connectivity @setup', async ({ page }) => {
    // 홈페이지 요청
    const response = await page.goto('/');

    // 응답 상태 확인
    expect(response?.status()).toBe(200);

    // 페이지가 실제로 로드되었는지 확인
    await page.waitForLoadState('networkidle');

    console.log('✅ Network connectivity is working');
  });

  test('javascript execution works @setup', async ({ page }) => {
    await page.goto('/');

    // JavaScript 실행 테스트
    const result = await page.evaluate(() => {
      return {
        hasDocument: typeof document !== 'undefined',
        hasWindow: typeof window !== 'undefined',
        timestamp: new Date().getTime()
      };
    });

    expect(result.hasDocument).toBe(true);
    expect(result.hasWindow).toBe(true);
    expect(result.timestamp).toBeGreaterThan(0);

    console.log('✅ JavaScript execution works');
  });
});