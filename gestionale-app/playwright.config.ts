import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseURL =
    process.env.PLAYWRIGHT_BASE_URL || (isCI ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173');

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    workers: isCI ? 1 : undefined,
    reporter: isCI ? 'github' : 'list',
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
        ? undefined
        : {
              command: isCI
                  ? 'npm run preview -- --host 127.0.0.1 --port 4173'
                  : 'npm run dev -- --host 127.0.0.1 --port 5173',
              url: baseURL,
              reuseExistingServer: !isCI,
              timeout: isCI ? 60_000 : 180_000,
          },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
