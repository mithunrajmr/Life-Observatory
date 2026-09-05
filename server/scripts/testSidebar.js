const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8080');
  await page.evaluate(() => {
    sessionStorage.removeItem('life_observatory_signed_out');
  });
  await page.reload();
  await page.waitForTimeout(2000);

  const sidebar = await page.$('aside');
  if (sidebar) {
    const box = await sidebar.boundingBox();
    console.log('Sidebar bounding box:', box);
    const buttons = await sidebar.$$('button');
    console.log('Sidebar buttons count:', buttons.length);
  const brandDiv = await page.$('aside > div:first-child');
  if (brandDiv) {
    const computed = await page.evaluate(el => {
      const s = window.getComputedStyle(el);
      return {
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        display: s.display,
        height: s.height
      };
    }, brandDiv);
    console.log('Brand div computed:', computed);
  }

  const btn1 = (await page.$$('aside button'))[1];
  if (btn1) {
    const computedBtn = await page.evaluate(el => {
      const s = window.getComputedStyle(el);
      return {
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        display: s.display,
        height: s.height,
        backgroundColor: s.backgroundColor,
        borderRadius: s.borderRadius
      };
    }, btn1);
    console.log('Btn 1 computed:', computedBtn);
  }
  } else {
    console.log('No aside found');
  }
  await browser.close();
})();

