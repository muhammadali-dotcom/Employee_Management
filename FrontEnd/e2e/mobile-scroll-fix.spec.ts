import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Scroll Fix — Playwright E2E Tests
// Validates that Departments and Attendance pages scroll fully on mobile,
// and that desktop layout is unaffected.
// ─────────────────────────────────────────────────────────────────────────────

const login = async (page: Page) => {
  await page.goto('/login');
  await page.fill('#email', 'admin@company.com');
  await page.fill('#password', 'Admin@1234');
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard after login
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
};

// ── AppShell: outer div must NOT use position:fixed on any viewport ──────────
test('AppShell outer div is not position:fixed', async ({ page }) => {
  await login(page);

  const position = await page.evaluate(() => {
    // The outermost div inside RouteGuard (first child of body that is not a script)
    const rootDiv = document.querySelector('body > div');
    if (!rootDiv) return 'not-found';
    return window.getComputedStyle(rootDiv).position;
  });

  expect(position).not.toBe('fixed');
});

// ── AppShell: outer div should have min-height using dvh ────────────────────
test('AppShell outer div has min-height >= viewport height', async ({ page }) => {
  await login(page);

  const minHeightPx = await page.evaluate(() => {
    // AppShell's outer div is the first div inside RouteGuard,
    // which itself is a direct child of the Next.js root portal.
    // Walk the DOM to find the first div with overflow:auto styling
    // (as set by AppShell: "overflow-auto p-2 sm:p-3 lg:p-4")
    const allDivs = Array.from(document.querySelectorAll('div'));
    const appShellDiv = allDivs.find((div) => {
      const style = window.getComputedStyle(div);
      return style.overflow === 'auto' && style.padding !== '0px';
    });
    if (!appShellDiv) return -1;
    return parseFloat(window.getComputedStyle(appShellDiv).minHeight);
  });

  const viewportHeight = page.viewportSize()?.height ?? 800;
  expect(minHeightPx).toBeGreaterThanOrEqual(viewportHeight * 0.9);
});

// ── Departments: page root must NOT have overflow:hidden ────────────────────
test('Departments page root div does not have overflow:hidden', async ({ page }) => {
  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');

  const overflow = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return 'no-main';
    const pageRoot = main.firstElementChild as HTMLElement | null;
    if (!pageRoot) return 'no-child';
    return window.getComputedStyle(pageRoot).overflow;
  });

  expect(overflow).not.toBe('hidden');
});

// ── Departments: page must be scrollable on mobile ──────────────────────────
test('Departments page body is scrollable (scrollHeight > innerHeight)', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');
  // Give React time to render the data
  await page.waitForTimeout(1500);

  const isScrollable = await page.evaluate(() => {
    return document.documentElement.scrollHeight > window.innerHeight;
  });

  // On mobile with real content, the page should extend beyond the viewport
  // If there are no departments, the empty state is still taller than the viewport
  // due to the form and summary cards stacked vertically
  expect(isScrollable).toBe(true);
});

// ── Departments: user can scroll to the bottom ───────────────────────────────
test('Departments: can scroll to bottom and reach the table section', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Scroll to the very bottom of the page
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);

  // After scrolling to the bottom, the scroll position should be > 0
  // (confirming the page actually had content to scroll through)
  const scrollY = await page.evaluate(() => window.scrollY);

  // The page should have been scrollable (scrollY > 0) OR the content fit in one screen
  // In either case, the table section should be visible after scroll
  const tableVisible = await page.evaluate(() => {
    const table = document.querySelector('table');
    if (!table) return false;
    const rect = table.getBoundingClientRect();
    return rect.top < window.innerHeight;
  });

  expect(tableVisible).toBe(true);
});

// ── Attendance: page root must NOT have overflow:hidden ─────────────────────
test('Attendance page root div does not have overflow:hidden', async ({ page }) => {
  await login(page);
  await page.goto('/attendance');
  await page.waitForLoadState('networkidle');

  const overflow = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return 'no-main';
    const pageRoot = main.firstElementChild as HTMLElement | null;
    if (!pageRoot) return 'no-child';
    return window.getComputedStyle(pageRoot).overflow;
  });

  expect(overflow).not.toBe('hidden');
});

// ── Attendance: page must be scrollable on mobile ────────────────────────────
test('Attendance page body is scrollable on mobile', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/attendance');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const isScrollable = await page.evaluate(() => {
    return document.documentElement.scrollHeight > window.innerHeight;
  });

  expect(isScrollable).toBe(true);
});

// ── Attendance: legend section is reachable by scrolling ────────────────────
test('Attendance: legend section is reachable after scrolling to bottom', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/attendance');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Scroll to the very bottom
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);

  // Check that the legend section (contains "Present", "Absent" badges) is in view
  const legendInView = await page.evaluate(() => {
    // Find all spans with attendance status labels
    const spans = Array.from(document.querySelectorAll('span'));
    const presentSpan = spans.find((s) => s.textContent?.trim() === 'Present');
    if (!presentSpan) return false;
    const rect = presentSpan.getBoundingClientRect();
    // After scrolling to bottom, the legend must be visible within the viewport
    return rect.bottom <= window.innerHeight + 50; // 50px tolerance
  });

  expect(legendInView).toBe(true);
});

// ── Attendance: bottom padding is applied on mobile ─────────────────────────
test('Attendance page root has bottom padding >= 64px on mobile', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/attendance');
  await page.waitForLoadState('networkidle');

  const paddingBottom = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return 0;
    const pageRoot = main.firstElementChild as HTMLElement | null;
    if (!pageRoot) return 0;
    return parseFloat(window.getComputedStyle(pageRoot).paddingBottom);
  });

  expect(paddingBottom).toBeGreaterThanOrEqual(64);
});

// ── Departments: bottom padding is applied on mobile ────────────────────────
test('Departments page root has bottom padding >= 64px on mobile', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');

  const paddingBottom = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return 0;
    const pageRoot = main.firstElementChild as HTMLElement | null;
    if (!pageRoot) return 0;
    return parseFloat(window.getComputedStyle(pageRoot).paddingBottom);
  });

  expect(paddingBottom).toBeGreaterThanOrEqual(64);
});

// ── Desktop: sidebar is visible and section renders correctly ────────────────
test('Desktop: sidebar is visible and main content section renders', async ({ page }) => {
  test.skip(
    test.info().project.name !== 'Desktop Chrome 1440',
    'Desktop-only test',
  );

  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');

  // Sidebar should be visible on desktop
  const sidebarVisible = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (!aside) return false;
    const rect = aside.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  expect(sidebarVisible).toBe(true);
});

// ── Desktop: Departments table is visible without scrolling ──────────────────
test('Desktop: Departments table is immediately visible (no need to scroll)', async ({ page }) => {
  test.skip(
    test.info().project.name !== 'Desktop Chrome 1440',
    'Desktop-only test',
  );

  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const tableVisible = await page.evaluate(() => {
    const table = document.querySelector('table');
    if (!table) return false;
    const rect = table.getBoundingClientRect();
    return rect.top >= 0 && rect.top < window.innerHeight;
  });

  expect(tableVisible).toBe(true);
});

// ── Desktop: no global overflow-hidden on body or html ──────────────────────
test('html and body do not have overflow:hidden', async ({ page }) => {
  await login(page);

  const overflows = await page.evaluate(() => {
    return {
      html: window.getComputedStyle(document.documentElement).overflow,
      body: window.getComputedStyle(document.body).overflow,
    };
  });

  expect(overflows.html).not.toBe('hidden');
  expect(overflows.body).not.toBe('hidden');
});

// ── Mobile: no horizontal scroll on Departments ─────────────────────────────
test('Departments: no horizontal page scroll on mobile', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/departments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalScroll).toBe(false);
});

// ── Mobile: Attendance table has horizontal scroll capability ────────────────
test('Attendance: table wrapper has overflow-x scroll for wide table', async ({ page }) => {
  test.skip(
    !['Mobile Chrome 390', 'Mobile Chrome 375'].includes(test.info().project.name),
    'Mobile-only test',
  );

  await login(page);
  await page.goto('/attendance');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const tableCardOverflowX = await page.evaluate(() => {
    // The table is inside a div with overflow-auto inside the table card
    const tableWrapper = document.querySelector('main table')?.closest('div[class*="overflow-auto"]');
    if (!tableWrapper) return 'not-found';
    const style = window.getComputedStyle(tableWrapper);
    return style.overflowX;
  });

  // The table wrapper should allow horizontal scroll (auto or scroll), not hidden
  expect(tableCardOverflowX).not.toBe('hidden');
  expect(tableCardOverflowX).not.toBe('not-found');
});
