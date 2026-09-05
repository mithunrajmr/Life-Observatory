const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../qa/screenshots');
const RECORDINGS_DIR = path.resolve(__dirname, '../../qa/recordings');

// Ensure directories exist
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

async function runQA() {
  console.log('[QA Runner] Launching Chromium browser with video recording...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Listen for console and page errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`[Browser Page Error]: ${err.message}`);
  });

  try {
    console.log(`[QA Runner] Navigating to ${BASE_URL}...`);
    // Start in clean unauthenticated state for 01-login.png
    await page.addInitScript(() => {
      sessionStorage.setItem('life_observatory_signed_out', 'true');
      localStorage.removeItem('life_observatory_demo_user');
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Step 1: Login / Unauthenticated state
    console.log('[QA Runner] Capturing 01-login.png (unauthenticated state)...');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login.png'), fullPage: false });

    // Authenticate via Sign In
    console.log('[QA Runner] Triggering Sign In...');
    const signInBtn = page.locator('button:has-text("Sign In with Google")').first();
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
    }

    // Wait for Life Horizon and longitudinal model to render
    console.log('[QA Runner] Waiting for authenticated dashboard to load...');
    await page.waitForSelector('text=Life Horizon', { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log('[QA Runner] Capturing 02-authenticated-home.png...');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-authenticated-home.png'), fullPage: false });

    // Step 2: Observatory & Life Horizon
    console.log('[QA Runner] Capturing 05-life-horizon.png...');
    const horizonSection = page.locator('text=Life Horizon').first();
    if (await horizonSection.count() > 0) {
      await horizonSection.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-life-horizon.png'), fullPage: false });

    // Step 3: Daily Reflection Test
    console.log('[QA Runner] Testing daily reflection input...');
    const reflectionTextarea = page.locator('textarea').first();
    await reflectionTextarea.scrollIntoViewIfNeeded();
    await reflectionTextarea.fill(
      "Today was pretty exhausting. Work was stressful, but I finally finished the feature I've been stuck on for a few weeks. I also went for a run after work."
    );
    await page.waitForTimeout(500);
    
    // Click "Record Reflection"
    const submitBtn = page.locator('button:has-text("Record Reflection")').first();
    await submitBtn.click();
    console.log('[QA Runner] Submitted reflection, waiting for structured signals...');
    await page.waitForTimeout(3000); // Wait for extraction

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-reflection-input.png'), fullPage: false });

    // Step 4: Adaptive follow-up test (ambiguous input)
    console.log('[QA Runner] Testing adaptive follow-up with ambiguous input...');
    await reflectionTextarea.fill("Had a weird meeting today and finally finished it.");
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-companion-followup.png'), fullPage: false });

    // Step 5: Invisible Progress Card
    console.log('[QA Runner] Capturing 06-invisible-progress.png...');
    const invProgress = page.locator('text=You May Not Have Noticed This').first();
    if (await invProgress.count() > 0) {
      await invProgress.scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-invisible-progress.png'), fullPage: false });

    // Step 6: What Changed View
    console.log('[QA Runner] Capturing 07-what-changed.png...');
    const whatChanged = page.locator('text=What Changed?').first();
    if (await whatChanged.count() > 0) {
      await whatChanged.scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-what-changed.png'), fullPage: false });

    // Step 7: Evidence Modal ("Why?")
    console.log('[QA Runner] Testing Evidence Modal...');
    const whyButton = page.locator('button:has-text("Why?")').first();
    if (await whyButton.count() > 0) {
      await whyButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-evidence.png'), fullPage: false });
      
      // Close modal
      const closeBtn = page.locator('button:has-text("Done")').or(page.locator('button[aria-label="Close evidence details"]')).first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Step 7.5: Drift Notice on Observatory Tab
    console.log('[QA Runner] Capturing 10-drift.png...');
    const driftNotice = page.locator('text=Intention vs. Activity Notice (Drift)').first();
    if (await driftNotice.count() > 0) {
      await driftNotice.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-drift.png'), fullPage: false });
    }

    // Step 8: Timeline & Turning Points
    console.log('[QA Runner] Navigating to Timeline tab...');
    await page.click('button:has-text("Timeline")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-turning-points.png'), fullPage: true });

    // Step 9: Goals & Focus, Predictions
    console.log('[QA Runner] Navigating to Goals & Focus tab...');
    await page.click('button:has-text("Goals & Focus")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-predictions.png'), fullPage: true });

    // Add a goal
    const addGoalBtn = page.locator('button:has-text("Add Goal")').first();
    if (await addGoalBtn.count() > 0) {
      await addGoalBtn.click();
      await page.waitForTimeout(300);
      await page.fill('input[placeholder*="workout"]', 'Consistent 3x weekly workout routine');
      await page.click('button:has-text("Save Goal")');
      await page.waitForTimeout(500);
    }

    // Step 10: Connections Settings
    console.log('[QA Runner] Navigating to Connections tab...');
    await page.click('button:has-text("Connections")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-connections.png'), fullPage: true });

    // Step 11: Talk (Companion & Advisor)
    console.log('[QA Runner] Navigating to Talk tab...');
    await page.click('button:has-text("Talk")');
    await page.waitForTimeout(800);

    const chatInput = page.locator('input[placeholder*="companion"]').first();
    if (await chatInput.count() > 0) {
      await chatInput.fill("I've been thinking about changing my job.");
      await page.keyboard.press('Enter');
      console.log('[QA Runner] Sent companion message, waiting for reply...');
      await page.waitForTimeout(3000);

      await chatInput.fill("How can I grow in my career?");
      await page.keyboard.press('Enter');
      console.log('[QA Runner] Sent strategic advisor question, waiting for structured advice...');
      await page.waitForTimeout(4000);
    }

    // Step 12: Mobile Viewport Test (375px)
    console.log('[QA Runner] Testing 375px mobile viewport...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13-mobile.png'), fullPage: true });

    // Reset to Desktop Viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    // Step 13: Error State Test
    console.log('[QA Runner] Testing safe error presentation...');
    await page.click('button:has-text("Observatory")');
    await page.waitForTimeout(500);
    const errTextarea = page.locator('textarea').first();
    await errTextarea.fill('Test entry exceeding limit: ' + 'x'.repeat(10050));
    await page.locator('button:has-text("Record Reflection")').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14-error-state.png'), fullPage: false });

    // Step 14: Logout
    console.log('[QA Runner] Testing Sign Out...');
    const signOutBtn = page.locator('button:has-text("Sign Out")').first();
    if (await signOutBtn.count() > 0) {
      await signOutBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15-logout.png'), fullPage: false });

    console.log('[QA Runner] All browser flows executed successfully!');
  } catch (error) {
    console.error('[QA Runner Error]:', error);
  } finally {
    // Close context to ensure video recording is flushed to disk
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const videoPath = await video.path();
      const targetVideoPath = path.join(RECORDINGS_DIR, 'full-user-journey.webm');
      try {
        fs.copyFileSync(videoPath, targetVideoPath);
        console.log(`[QA Runner] Saved full video recording to: ${targetVideoPath}`);
      } catch (err) {
        console.warn(`[QA Runner] Could not copy video file: ${err.message}`);
      }
    }
  }
}

runQA().then(() => {
  console.log('[QA Runner] QA run completed.');
  process.exit(0);
}).catch(err => {
  console.error('[QA Runner Fatal]:', err);
  process.exit(1);
});
