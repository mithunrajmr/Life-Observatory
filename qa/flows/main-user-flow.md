# Life Observatory — Main User Flow & Reproducible Evaluation Runbook

This runbook documents the complete end-to-end evaluation journey for **Life Observatory**, an evidence-backed longitudinal self-reflection and change visualization platform powered by Gemini 2.5 on Google Cloud Run.

---

## 1. Prerequisites & Environment Setup

- **Runtime**: Node.js v20+ or v22+
- **Browser**: Google Chrome / Chromium (tested on Chromium 133)
- **Local Port**: `http://localhost:8080` (or deployed Cloud Run URL)
- **Dependencies**: Installed via `npm install` in root, `client/`, and `server/`

### Launching the Application Locally
```bash
# In Life Observatory root directory:
npm run build
npm start
# Server listens on port 8080 and serves production client bundle from client/dist
```

### Reproducing Browser QA Execution
```bash
cd server
node scripts/runFinalBrowserQA.js
# Executes automated Playwright browser journey, captures 15 final screenshots, and saves full video
```

---

## 2. Step-by-Step Evaluator Journey & Screen Verification

### Step 1: Unauthenticated Landing & Hero Introduction (`01-login-final.png`)
1. Navigate to `http://localhost:8080/`.
2. Notice the clean, dark-mode header with brand badge **"Life Observatory • See Gradual Change"**.
3. View the editorial headline: *"See how your life is quietly changing."*
4. Three preview pillars introduce the instrument: *The Life Horizon*, *Invisible Progress*, and *Zero-Friction Check-in*.
5. Two clear primary actions: **"Explore Alex's 4-Month Journey"** (demo access) and **"Sign In with Google"**.
6. Evidence captured in: [`qa/screenshots/final/01-login-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/01-login-final.png).

### Step 2: Authenticated Observatory Home (`02-observatory-final.png`)
1. Click **"Explore Alex's 4-Month Journey"** or **"Sign In with Google"**.
2. Notice the personalized greeting: *"Good afternoon, Alex."* with subtitle *"Making gradual change visible — your patterns, progress, and turning points over time."*
3. The page hierarchy places the emotional discovery centerpiece prominently above the fold:
   - **"You May Not Have Noticed This"**: *"Your learning has quietly changed."*
   - Before (6 weeks ago) vs. Today trajectory shifts (+42% Learning, +35% Career, steady Energy)
   - *"See Why & Evidence"* button
   - Defining multi-domain **Life Horizon** landscape begins directly below.
4. Evidence captured in: [`qa/screenshots/final/02-observatory-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/02-observatory-final.png).

### Step 3: Life Horizon Multi-Domain Visualization (`05-life-horizon-final.png`)
1. Scroll to the **Life Horizon** longitudinal landscape.
2. View the unified horizontal time axis from June 2026 to September 2026.
3. Observe smooth Bézier trajectory curves with area gradient fills and amplified vertical dynamics (2.2x multiplier) rendering clear crests, troughs, and inflection points.
4. Interactive controls:
   - **Timeframe Scrubber**: Toggle between `1M`, `3M`, `6M`, `1Y`, and `All`.
   - **Domain Filter Pills**: Filter curves by domain (`All Domains`, `Career & Work`, `Learning & Skills`, `Health & Fitness`, `Relationships`, `Energy & Wellbeing`, `Personal Projects`, `Financial Wellbeing`).
   - Monthly date ticks (`19 Jun`, `10 Jul`, `31 Jul`, `21 Aug`, `4 Sept`).
5. Evidence captured in: [`qa/screenshots/final/05-life-horizon-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/05-life-horizon-final.png).

### Step 4: Proactive Invisible Progress Card (`06-invisible-progress-final.png`)
1. View the **"You May Not Have Noticed This"** card.
2. Note the contrasting comparison:
   - **Prior State**: *"6 weeks ago: mostly intentions and sporadic tutorials"*
   - **Current State**: *"Today: 35 consecutive days of deliberate practice and a completed project"*
   - Trajectory shift badges: Learning (+42%), Career (+35%), Energy (steady).
3. Evidence captured in: [`qa/screenshots/final/06-invisible-progress-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/06-invisible-progress-final.png).

### Step 5: Provenance & Evidence Modal — "Why?" (`09-evidence-final.png`)
1. Click the **"See Why & Evidence"** button on the Invisible Progress card.
2. The Evidence Modal opens centered in the viewport with backdrop blur:
   - Displays model confidence tier: `CONFIDENCE: HIGH`.
   - Lists concrete observed source records with timestamps (*"Completed course certification and deployed first version of personal project - 3 Sept 2026"*).
   - Confirms model synthesis verified against the user's longitudinal Life Model.
3. Click **"Done"** or press Escape to dismiss.
4. Evidence captured in: [`qa/screenshots/final/09-evidence-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/09-evidence-final.png).

### Step 6: Period Transition Comparison — "What Changed?" (`07-what-changed-final.png`)
1. Scroll to the **What Changed?** panel.
2. Toggle between period comparisons:
   - *June 2026 → August 2026*
   - *July 2026 → August 2026*
3. Review the narrative revelation and shift indicators:
   - Learning & Skills: +42% (daily practice habit established)
   - Career & Work: +35% (promoted to initiative lead)
   - Health & Fitness: +28% (resumed 3x morning runs)
   - Relationships: -18% (sprint crunch trade-off, now rebounding)
   - Energy & Wellbeing: steady (recovered after July burnout dip)
4. Evidence captured in: [`qa/screenshots/final/07-what-changed-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/07-what-changed-final.png).

### Step 7: Intention vs. Activity Notice (Drift) (`10-drift-final.png`)
1. Review the **Drift Notice** card.
2. Identifies divergence between stated intentions and calendar/reflection reality:
   - Stated intention: *"Weekend Social Restorative Time"*
   - Reality: Work crunch crowded out weekend restorative time during sprint delivery; balance now being restored.
3. Evidence captured in: [`qa/screenshots/final/10-drift-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/10-drift-final.png).

### Step 8: Daily Natural-Language Reflection (`03-reflection-final.png`)
1. Scroll to the **Daily Reflection** dock (*"How was today?"*).
2. Enter a natural reflection:
   > *"Productive day today. The team completed the consensus state machine refactoring and passed all 20 test cases. Celebrated with an evening team dinner, and I managed an early morning run."*
3. Click **"Send Reflection"**.
4. Gemini extracts structured observations and displays real-time event badges (*Daily Accomplishment & Milestone* [Health & Fitness] [Career & Work]) with zero questionnaire friction.
5. Evidence captured in: [`qa/screenshots/final/03-reflection-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/03-reflection-final.png).

### Step 9: Companion Conversation & Strategic Advisory (`04-companion-final.png`)
1. Click the **"Talk"** tab in the navbar.
2. Enter a personal query:
   > *"I feel my energy is finally stabilizing, but I want to make sure I don't repeat the July crunch burnout."*
3. The companion provides a grounded, non-judgmental response referencing Alex's actual trajectory signals.
4. Evidence captured in: [`qa/screenshots/final/04-companion-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/04-companion-final.png).

### Step 10: Timeline & Key Turning Points (`08-turning-points-final.png`)
1. Click the **"Timeline"** tab in the navbar.
2. Review chronological turning point cards:
   - *Took On Project Leadership* (27 Jun 2026)
   - *Workload Crunch & Friend Isolation* (25 Jul 2026)
   - *Morning Routine & Health Reset* (1 Aug 2026)
   - *Milestone Delivery & Social Reconnection* (29 Aug 2026)
3. Expand milestones to review *"What Happened"*, *"Why It Mattered"*, and *"Trajectory Shift & Impact"*.
4. Evidence captured in: [`qa/screenshots/final/08-turning-points-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/08-turning-points-final.png).

### Step 11: Goals, Priorities & Predictions (`11-predictions-final.png`)
1. Click the **"Goals & Focus"** tab.
2. Review active priorities (*"Consistent 3x weekly workout routine"*, *"Protect weekend restorative time"*).
3. Review **Prediction → Outcome Learning** tracker with evaluated predictions.
4. Evidence captured in: [`qa/screenshots/final/11-predictions-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/11-predictions-final.png).

### Step 12: Connected Data & Privacy Controls (`12-connections-final.png`)
1. Click the **"Connections"** tab.
2. Review data privacy assurances and active Daily Reflections status.
3. Review Google Calendar sync trigger.
4. Review *"Right to Erasure & Complete Account Data Deletion"*.
5. Evidence captured in: [`qa/screenshots/final/12-connections-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/12-connections-final.png).

### Step 13: Mobile Responsive Viewport at 375px (`13-mobile-final.png`)
1. View application in 375px mobile viewport.
2. Verify:
   - Single-column vertical layout with fluid typography
   - Horizontally scrollable domain pills
   - Responsive SVG trajectory scaling
   - Zero horizontal overflow or content clipping
3. Evidence captured in: [`qa/screenshots/final/13-mobile-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/13-mobile-final.png).

### Step 14: Safe Error Presentation & Validation (`14-error-final.png`)
1. Enter an entry exceeding the 10,000-character safety limit in the reflection dock.
2. Click **"Send Reflection"**.
3. Observe structured, user-facing error message without application crash or stack trace exposure.
4. Evidence captured in: [`qa/screenshots/final/14-error-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/14-error-final.png).

### Step 15: Session Termination & Sign Out (`15-logout-final.png`)
1. Click the **"Sign Out"** button in the header.
2. Verify cached user state is purged and application cleanly returns to the unauthenticated Landing View.
3. Evidence captured in: [`qa/screenshots/final/15-logout-final.png`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/screenshots/final/15-logout-final.png).

---

## 3. Video Recording Evidence

The full user journey was recorded during automated browser execution and persisted to:
- [`qa/recordings/final/full-user-journey-final.webm`](file:///c:/Users/2mrmi/OneDrive/Documents/github-clone/Life%20Observatory/qa/recordings/final/full-user-journey-final.webm) (~2.94 MB)
