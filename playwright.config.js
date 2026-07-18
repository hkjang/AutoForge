import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:'./browser-e2e',
  timeout:30_000,
  fullyParallel:false,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:4176',trace:'retain-on-failure'},
  webServer:{
    command:'node server/index.js',
    url:'http://127.0.0.1:4176/api/ready',
    reuseExistingServer:false,
    timeout:30_000,
    env:{PORT:'4176',AUTOFORGE_REQUIRE_AUTH:'true',AUTOFORGE_DEMO_PASSWORD:'browser-e2e-password',AUTOFORGE_DATA_DIR:'.tmp/browser-e2e-data',AUTOFORGE_ARTIFACT_DIR:'.tmp/browser-e2e-data/artifacts'}
  },
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['Pixel 7']}}
  ]
});
