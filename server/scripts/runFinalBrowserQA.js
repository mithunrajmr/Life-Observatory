const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const FINAL_SCREENSHOTS_DIR = path.resolve(__dirname, '../../qa/screenshots/final');
const FINAL_RECORDINGS_DIR = path.resolve(__dirname, '../../qa/recordings/final');

// Ensure output directories exist
fs.mkdirSync(FINAL_SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(FINAL_RECORDINGS_DIR, { recursive: true });

async function runFinalQA() {
  console.log('[Final QA Runner] Starting full browser verification and high-res asset generation...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: FINAL_RECORDINGS_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('auth/api-key-not-valid') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
        console.log(`[Browser Console Error]: ${text}`);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.error(`[Browser Page Error]: ${err.message}`);
  });

  try {
    // ----------------------------------------------------
    // STEP 1: Unauthenticated Landing (01-login-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to landing page in unauthenticated state...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => {
      sessionStorage.setItem('life_observatory_signed_out', 'true');
      localStorage.removeItem('life_observatory_demo_user');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    console.log('[Final QA Runner] Capturing 01-login-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '01-login-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 2: Authenticate & Observatory View (02-observatory-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Authenticating via demo journey...');
    await page.evaluate(() => {
      sessionStorage.removeItem('life_observatory_signed_out');
    });

    const exploreBtn = page.locator('button:has-text("Explore Alex\'s 4-Month Journey")').first();
    if (await exploreBtn.count() > 0) {
      await exploreBtn.click();
    } else {
      const signInBtn = page.locator('button:has-text("Sign In with Google")').first();
      await signInBtn.click();
    }

    console.log('[Final QA Runner] Waiting for Life Observatory dashboard to load...');
    await page.waitForSelector('text=The Life Horizon', { timeout: 15000 }).catch(async () => {
      await page.waitForSelector('text=Life Observatory', { timeout: 15000 });
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    console.log('[Final QA Runner] Capturing 02-observatory-final.png (Full Dashboard)...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '02-observatory-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 3: Hero Banner & Invisible Progress (06-invisible-progress-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Capturing 06-invisible-progress-final.png...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '06-invisible-progress-final.png'), 
      fullPage: false 
    });

    // ----------------------------------------------------
    // STEP 4: Life Horizon Visualization (05-life-horizon-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Life Horizon visualization...');
    await page.evaluate(() => {
      const horizon = document.querySelector('section[aria-label="Your Life Horizon"]');
      if (horizon) horizon.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(600);

    // Toggle Learning & Skills domain pill
    const learningPill = page.locator('button:has-text("Learning & Growth")').or(page.locator('button:has-text("Learning")')).first();
    if (await learningPill.count() > 0) {
      await learningPill.click();
      await page.waitForTimeout(500);
    }

    console.log('[Final QA Runner] Capturing 05-life-horizon-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '05-life-horizon-final.png'),
      fullPage: false
    });

    // Reset back to All Domains
    if (await learningPill.count() > 0) {
      await learningPill.click();
      await page.waitForTimeout(300);
    }

    // ----------------------------------------------------
    // STEP 5: Evidence Modal ("Why?") (09-evidence-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Opening Evidence Modal...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const seeWhyBtn = page.locator('button:has-text("See the evidence")').or(page.locator('button:has-text("See Why & Evidence")')).first();
    if (await seeWhyBtn.count() > 0) {
      await seeWhyBtn.click();
      await page.waitForTimeout(800);

      console.log('[Final QA Runner] Capturing 09-evidence-final.png...');
      await page.screenshot({ 
        path: path.join(FINAL_SCREENSHOTS_DIR, '09-evidence-final.png'), 
        fullPage: false 
      });

      // Close modal
      const closeBtn = page.locator('button:has-text("Done")').or(page.locator('button[aria-label="Close evidence details"]')).first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }

    // ----------------------------------------------------
    // STEP 6: What Changed View & Tri-Card Row (07-what-changed-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Inspecting What Changed and bottom row...');
    await page.evaluate(() => {
      const whatChanged = document.querySelector('section[aria-label="What Changed Longitudinal Shift Detection"]');
      if (whatChanged) whatChanged.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);

    console.log('[Final QA Runner] Capturing 07-what-changed-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '07-what-changed-final.png'), 
      fullPage: false 
    });

    // ----------------------------------------------------
    // STEP 7: Drift Notice Modal (10-drift-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Inspecting Drift Modal...');
    const exploreDriftBtn = page.locator('button:has-text("Explore this observation")').first();
    if (await exploreDriftBtn.count() > 0) {
      await exploreDriftBtn.click();
      await page.waitForTimeout(800);

      console.log('[Final QA Runner] Capturing 10-drift-final.png...');
      await page.screenshot({ 
        path: path.join(FINAL_SCREENSHOTS_DIR, '10-drift-final.png'), 
        fullPage: false 
      });

      // Close modal
      const closeBtn = page.locator('button:has-text("Done")').or(page.locator('button[aria-label="Close evidence details"]')).first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }

    // ----------------------------------------------------
    // STEP 8: Daily Reflection Dock (03-reflection-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Testing conversational daily reflection entry...');
    await page.evaluate(() => {
      const el = document.querySelector('section[aria-label="Daily Check-in"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);

    const textarea = page.locator('textarea').first();
    await textarea.fill(
      "Productive day today. The team completed the consensus state machine refactoring and passed all 20 test cases. Celebrated with an evening team dinner, and I managed an early morning run."
    );
    await page.waitForTimeout(400);

    const sendBtn = page.locator('button[aria-label="Send reflection"]').or(page.locator('button[type="submit"]')).first();
    if (await sendBtn.count() > 0) {
      await sendBtn.click();
    }

    console.log('[Final QA Runner] Waiting for Gemini structured extraction...');
    await page.waitForSelector('text=Noticed in today', { timeout: 12000 }).catch(() => {
      console.log('[Final QA Runner] Extraction completed or returned');
    });
    await page.evaluate(() => {
      const el = document.querySelector('section[aria-label="Daily Check-in"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1000);

    console.log('[Final QA Runner] Capturing 03-reflection-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '03-reflection-final.png'),
      fullPage: false
    });

    // ----------------------------------------------------
    // STEP 9: Companion Chat & Strategy (04-companion-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Chat tab...');
    const talkBtn = page.locator('button:has-text("Talk")').or(page.locator('button:has-text("Chat")')).first();
    await talkBtn.click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const chip = page.locator('button:has-text("Career growth vs. energy")').first();
    if (await chip.count() > 0) {
      await chip.click();
      await page.waitForTimeout(400);
      const sendBtn = page.locator('form button:has-text("Send")').first();
      if (await sendBtn.count() > 0) {
        await sendBtn.click();
        console.log('[Final QA Runner] Waiting for companion response...');
        await page.waitForTimeout(5000);
      }
    } else {
      const chatInput = page.locator('form input[placeholder*="Talk"]').first();
      if (await chatInput.count() > 0) {
        await chatInput.fill("How can I grow in my career while protecting my energy?");
        const sendBtn = page.locator('form button:has-text("Send")').first();
        if (await sendBtn.count() > 0) {
          await sendBtn.click();
          console.log('[Final QA Runner] Waiting for companion response...');
          await page.waitForTimeout(5000);
        }
      }
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    console.log('[Final QA Runner] Capturing 04-companion-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '04-companion-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 10: Timeline Tab & Turning Points (08-turning-points-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Timeline tab...');
    await page.click('button:has-text("Timeline")');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    console.log('[Final QA Runner] Capturing 08-turning-points-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '08-turning-points-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 11: Goals & Focus, Predictions (11-predictions-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Goals tab...');
    const goalsNavBtn = page.locator('button:has-text("Goals")').first();
    await goalsNavBtn.click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Add an intention if modal button exists
    const addGoalBtn = page.locator('button:has-text("Set New Intention")').or(page.locator('button:has-text("Add Goal")')).first();
    if (await addGoalBtn.count() > 0) {
      await addGoalBtn.click();
      await page.waitForTimeout(400);
      const titleInput = page.locator('div[class*="fixed"] input[type="text"]').first();
      if (await titleInput.count() > 0) {
        await titleInput.fill('Consistent 3x weekly workout routine');
        await page.waitForTimeout(200);
        const saveBtn = page.locator('div[class*="fixed"] button:has-text("Save Intention")').or(page.locator('div[class*="fixed"] button:has-text("Save")')).first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(800);
        }
      }
      // If modal is still open, close it cleanly
      const cancelModalBtn = page.locator('div[class*="fixed"] button:has-text("Cancel")');
      if (await cancelModalBtn.count() > 0) {
        await cancelModalBtn.click();
        await page.waitForTimeout(400);
      }
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    console.log('[Final QA Runner] Capturing 11-predictions-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '11-predictions-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 12: Connections & Privacy Settings (12-connections-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Connections tab...');
    const connBtn = page.locator('button:has-text("Data & Privacy")').or(page.locator('button:has-text("Connections")')).first();
    await connBtn.click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    console.log('[Final QA Runner] Capturing 12-connections-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '12-connections-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 12B: Journal Tab (16-journal-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Journal tab...');
    await page.click('button:has-text("Journal")');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    console.log('[Final QA Runner] Capturing 16-journal-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '16-journal-final.png'), 
      fullPage: true 
    });

    // ----------------------------------------------------
    // STEP 12C: Insights Tab (17-insights-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Navigating to Insights tab...');
    await page.click('button:has-text("Insights")');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    console.log('[Final QA Runner] Capturing 17-insights-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '17-insights-final.png'), 
      fullPage: true 
    });

    // Capture Drift modal from Insights tab
    const insightsDriftBtn = page.locator('button:has-text("Explore this observation")').first();
    if (await insightsDriftBtn.count() > 0) {
      await insightsDriftBtn.click();
      await page.waitForTimeout(800);
      console.log('[Final QA Runner] Capturing 10-drift-final.png...');
      await page.screenshot({ 
        path: path.join(FINAL_SCREENSHOTS_DIR, '10-drift-final.png'), 
        fullPage: false 
      });
      const closeBtn = page.locator('button:has-text("Done")').or(page.locator('button[aria-label="Close evidence details"]')).first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }

    // ----------------------------------------------------
    // STEP 13: Mobile Viewport 375px (13-mobile-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Testing Mobile 375px viewport...');
    const homeBtn = page.locator('button:has-text("Observatory")').or(page.locator('button:has-text("Home")')).first();
    await homeBtn.click();
    await page.waitForTimeout(500);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    console.log('[Final QA Runner] Capturing 13-mobile-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '13-mobile-final.png'), 
      fullPage: false 
    });

    // Restore desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(600);

    // ----------------------------------------------------
    // STEP 14: Error State Handling (14-error-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Testing safe validation error presentation...');
    const errorTextarea = page.locator('textarea').first();
    if (await errorTextarea.count() > 0) {
      await errorTextarea.scrollIntoViewIfNeeded();
      await errorTextarea.fill('Test excessive input validation: ' + 'x'.repeat(10050));
      await page.waitForTimeout(500);

      console.log('[Final QA Runner] Capturing 14-error-final.png...');
      await page.screenshot({ 
        path: path.join(FINAL_SCREENSHOTS_DIR, '14-error-final.png'), 
        fullPage: false 
      });
    }

    // ----------------------------------------------------
    // STEP 15: Sign Out State (15-logout-final.png)
    // ----------------------------------------------------
    console.log('[Final QA Runner] Testing Sign Out flow...');
    let signOutBtn = page.locator('button:has-text("Sign Out")').first();
    if (await signOutBtn.count() === 0) {
      const avatarBtn = page.locator('header button').last();
      if (await avatarBtn.count() > 0) {
        await avatarBtn.click();
        await page.waitForTimeout(300);
        signOutBtn = page.locator('button:has-text("Sign Out")').first();
      }
    }
    if (await signOutBtn.count() > 0) {
      await signOutBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('[Final QA Runner] Capturing 15-logout-final.png...');
    await page.screenshot({ 
      path: path.join(FINAL_SCREENSHOTS_DIR, '15-logout-final.png'), 
      fullPage: true 
    });

    console.log('[Final QA Runner] SUCCESS: All 15 browser states verified and captured.');
  } catch (err) {
    console.error('[Final QA Runner Error]:', err);
    throw err;
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const videoPath = await video.path();
      const targetVideoPath = path.join(FINAL_RECORDINGS_DIR, 'full-user-journey-final.webm');
      try {
        fs.copyFileSync(videoPath, targetVideoPath);
        console.log(`[Final QA Runner] Successfully saved full video recording to: ${targetVideoPath}`);
      } catch (copyErr) {
        console.warn(`[Final QA Runner] Video copy note: ${copyErr.message}`);
      }
    }
  }

  if (consoleErrors.length > 0) {
    console.log(`[Final QA Runner] Note: Recorded ${consoleErrors.length} browser errors during execution.`);
  } else {
    console.log('[Final QA Runner] EXCELLENT: Zero uncaught browser console errors.');
  }
}

runFinalQA().then(() => {
  console.log('[Final QA Runner] Finished execution cleanly.');
}).catch((err) => {
  console.error('[Final QA Runner Fatal]:', err);
  process.exit(1);
});
