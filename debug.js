import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  await page.goto('http://localhost:4174', { waitUntil: 'networkidle' });
  
  console.log('Page loaded. Capturing screenshot...');
  await page.screenshot({ path: 'debug_screenshot.png' });
  
  console.log('Typing credentials...');
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log In")');
  
  console.log('Waiting for network idle...');
  await page.waitForTimeout(3000); // Wait for auth and fetch
  
  await page.screenshot({ path: 'debug_screenshot2.png' });
  const bodyContent2 = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY HTML 2 LENGTH:', bodyContent2.length);
  
  await browser.close();
})();
