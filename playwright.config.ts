import { defineConfig, devices } from "@playwright/test";

// Bosh sahifa uchun tutun testlari (smoke tests): avval `npm run build`, keyin `npm run test:e2e`.
// Tizimdagi Google Chrome ishlatiladi (channel: "chrome") — alohida brauzer yuklab olinmaydi.
const PORT = 3200;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    channel: "chrome",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    // small laptops / tablets in landscape: where wide headings used to spill out of their columns
    { name: "laptop", use: { viewport: { width: 1024, height: 768 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: `npx next start -p ${PORT}`, port: PORT, reuseExistingServer: true, timeout: 60_000 },
});
