import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./testes/navegador",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "celular",
      use: { ...devices["iPhone 13"], defaultBrowserType: "webkit" },
    },
  ],
});
