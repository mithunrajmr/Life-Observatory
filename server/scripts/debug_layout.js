const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);

  const sidebarBBox = await page.locator('aside').boundingBox();
  const heroBBox = await page.locator('section').first().boundingBox();
  const leafSvgBBox = await page.locator('aside svg').last().boundingBox();

  console.log('Sidebar bounding box:', sidebarBBox);
  console.log('Hero banner bounding box:', heroBBox);
  console.log('Leaf SVG bounding box:', leafSvgBBox);

  // Check body font
  const bodyFont = await page.evaluate(() => window.getComputedStyle(document.body).fontFamily);
  console.log('Body font family:', bodyFont);

  // Check if grid layout has 2 columns
  const mainGridDisplay = await page.evaluate(() => {
    const el = document.querySelector('.grid');
    return el ? window.getComputedStyle(el).display : 'not found';
  });
  console.log('Main grid display:', mainGridDisplay);

  await browser.close();
})();
