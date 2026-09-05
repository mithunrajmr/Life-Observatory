const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(600);

  const demoBtn = page.locator('button:has-text("Demo: Alex")').first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const outPath = path.resolve(__dirname, '../../qa/screenshots/final/13-mobile-final.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Mobile screenshot saved to', outPath);

  // Also copy to brain
  const brainDir = 'C:/Users/2mrmi/.gemini/antigravity-ide/brain/6975972a-595f-4dbe-a5e2-b538e988a451/screenshots';
  fs.copyFileSync(outPath, path.join(brainDir, '13-mobile-final.png'));
  console.log('Copied to brain directory');

  await browser.close();
})();
