# ANTIGRAVITY_BUILD_PROMPT.md
## Autonomous Build Instruction for Life Observatory

You are the autonomous engineering agent responsible for building the **Life Observatory** application.

The authoritative product and engineering requirements are in:

```text
MASTER_SPEC.md
```

Read that file completely before making implementation decisions.

---

# 1. PRIMARY DIRECTIVE

**BUILD THE WORKING APPLICATION.**

Do not stop after:

- creating a plan;
- explaining architecture;
- generating pseudocode;
- listing TODOs;
- writing a partial scaffold.

A plan is not the deliverable.

The working, tested application is the deliverable.

Use `MASTER_SPEC.md` as the authoritative product contract while exercising normal engineering judgment for implementation details.

Do not blindly implement contradictory or obsolete details if the workspace or current platform APIs show a better implementation. Preserve the product intent and security constraints.

---

# 2. FIRST ACTIONS

Before modifying anything:

1. Inspect the existing workspace.
2. Identify whether an existing app/repository already exists.
3. Inspect package configuration and current framework.
4. Inspect Firebase configuration if present.
5. Inspect Cloud Run/deployment configuration.
6. Inspect Firestore rules.
7. Inspect current Gemini integration.
8. Inspect tests.
9. Inspect existing AI Studio artifacts if present.
10. Read `MASTER_SPEC.md` fully.

Do not delete useful existing work simply because the repository differs from the proposed structure.

Reconcile the existing implementation with the Master Specification.

---

# 3. AI STUDIO / ORIGIN REQUIREMENT

The project should preserve a clear AI Studio-originated development story.

If AI Studio baseline artifacts are missing:

- create `docs/ai-studio/custom-instructions.md`;
- create `docs/ai-studio/threat-model.md`;
- document the intended AI Studio security/build workflow.

Do not falsely claim that something was executed in AI Studio when it was not.

If an existing AI Studio export is present, preserve and improve it.

The intended development flow is:

```text
Google AI Studio
  ↓
Custom security instructions
  ↓
Initial architecture/baseline
  ↓
GitHub
  ↓
Antigravity
  ↓
Production implementation and tests
  ↓
Cloud Run
```

Google AI Studio currently supports full-stack Build mode, GitHub synchronization/import, local export, and Cloud Run deployment. Use the current official documentation when necessary:
https://ai.google.dev/gemini-api/docs/aistudio-build-mode

---

# 4. ENGINEERING ORDER

Execute in an order that keeps the application runnable:

## Phase A — Inspect and stabilize

- inspect current project;
- establish a clean baseline;
- ensure installation/build/test commands work;
- document assumptions.

## Phase B — Security foundation

- Firebase Authentication;
- backend Firebase ID token verification;
- server-side UID derivation;
- Firestore ownership;
- explicit rules;
- Secret Manager integration;
- safe CORS;
- safe errors;
- basic rate limits.

## Phase C — Core conversational experience

- multi-turn Gemini chat;
- reflection flow;
- short adaptive follow-up behavior;
- conversation persistence.

## Phase D — Life Model

- reflection ingestion;
- structured extraction;
- schema validation;
- event/evidence persistence;
- deterministic aggregation;
- snapshots.

## Phase E — Observatory UI

- Life Horizon;
- Invisible Progress;
- What Changed?;
- Turning Points;
- evidence;
- uncertainty.

## Phase F — Differentiation

- Drift;
- prediction → outcome;
- user corrections;
- focus domains.

## Phase G — External source

- Calendar first;
- only then Gmail/Drive if the implementation remains reliable.

## Phase H — Hardening

- tests;
- security negative cases;
- accessibility;
- responsive UI;
- production build;
- deployment.

---

# 5. PRODUCT BEHAVIOR IS NON-NEGOTIABLE

The application must NOT become a generic journal.

The central user experience is:

> **“Show me how my life is changing.”**

The user should see meaningful progress or setbacks without having to ask:

> “Am I progressing?”

The system should proactively surface:

- Invisible Progress;
- What Changed?;
- Turning Points;
- Drift;
- supported patterns.

It must also remain willing to report decline.

Never manufacture optimism.

---

# 6. DO NOT OVER-QUESTION THE USER

For daily reflection:

Input can be one paragraph.

Example:

> “Rough day. Work was stressful but I finished the feature and finally started the course.”

The system should extract meaningful events.

Ask a follow-up only if:

1. the missing information materially changes interpretation;
2. a short clarification can resolve it;
3. the answer is worth the interruption.

Ask at most one concise clarification at a time.

Do not convert reflection into a questionnaire.

---

# 7. COMPANION PERSONALITY

The assistant should feel context-aware and familiar through useful memory.

It should not claim human feelings or dependence.

Use:

- warmth;
- brevity;
- familiarity;
- honesty;
- emotional awareness.

For strategic questions, become more analytical.

Example:

User:
> “How can I grow in life?”

Do not output generic motivation.

Use the user's actual history:

- identify evidence;
- identify patterns;
- identify uncertainty;
- ask targeted questions where necessary;
- give practical options;
- explain tradeoffs.

---

# 8. IMPLEMENT AI AS SEPARATE RESPONSIBILITIES

Do NOT create one giant Gemini prompt.

Implement separate operations:

### Conversation
Natural multi-turn dialogue.

### Extraction
Strict structured JSON for events/signals.

### Insight synthesis
Deeper analysis only when triggered.

### Prediction/outcome review
Separate operation.

Normal application code handles:

- sorting;
- arithmetic;
- aggregation;
- visualization;
- filtering;
- time comparison;
- snapshot loading.

Gemini should not be responsible for rendering charts.

---

# 9. INCREMENTAL AI ARCHITECTURE

Implement:

```text
new input
  ↓
incremental extraction
  ↓
validate structured result
  ↓
persist
  ↓
deterministic update
  ↓
significance check
  ↓
deep synthesis only when justified
  ↓
persist insight/snapshot
```

Never do this:

```text
every page load
  ↓
read entire life history
  ↓
send to Gemini
  ↓
rebuild chart
```

Use persisted structured state.

If context caching is beneficial, use it only where the same substantial context is actually reused. Do not use caching as a substitute for good data modeling.

---

# 10. STRUCTURED OUTPUT

Use JSON schema validation.

At minimum, extracted results should support:

```text
events
domain signals
goals affected
achievements
setbacks
decisions
predictions
candidate turning points
evidence
confidence
```

Reject malformed or unsupported model output.

No model output should directly execute privileged operations.

---

# 11. PROVENANCE

Every important insight must be traceable.

Represent:

```text
USER_SAID
OBSERVED
INFERRED
PATTERN
AI_INTERPRETATION
```

Do not expose unsupported inference as fact.

Examples:

Good:

> “Observed: six related calendar events.”

> “Inference: your learning activity appears to be becoming more consistent.”

Bad:

> “You are definitely becoming more confident.”

unless the evidence genuinely supports it.

---

# 12. LIFE MODEL

Implement the structured model described in `MASTER_SPEC.md`.

Core entities:

```text
reflections
conversations
events
goals
decisions
predictions
outcomes
patterns
turningPoints
evidence
insights
snapshots
connections
```

Use authenticated UID as the source of ownership.

Do not trust client-provided UID.

---

# 13. FIRESTORE SECURITY

Use user-scoped paths:

```text
/users/{uid}/...
```

Prefer explicit collection rules.

Do not use broad future-collection wildcard access as the main authorization mechanism.

At minimum, user-owned documents must require:

```text
request.auth != null
&& request.auth.uid == uid
```

Validate appropriate fields and prevent ownership reassignment.

Remember:

**Server client libraries bypass Firestore Security Rules.**

Therefore backend code using the Admin SDK MUST independently enforce ownership after verifying the Firebase ID token.

Official reference:
https://firebase.google.com/docs/firestore/security/rules-structure

---

# 14. AUTHENTICATION

Use Firebase Authentication with Google Sign-In.

Frontend:

- authenticate user;
- obtain ID token;
- call backend using `Authorization: Bearer <token>`.

Backend:

- verify Firebase token;
- obtain verified UID;
- reject invalid requests.

Do not trust:

```text
req.body.uid
query.userId
path UID supplied without authorization
```

Use the verified authenticated identity.

---

# 15. SECRET MANAGER

Gemini credentials must be server-side.

Use Google Cloud Secret Manager.

Cloud Run service identity should access the secret with:

```text
roles/secretmanager.secretAccessor
```

Do not:

- commit credentials;
- expose them to client JavaScript;
- log them;
- put them in URLs;
- return them to the frontend.

Official reference:
https://docs.cloud.google.com/run/docs/configuring/services/secrets

---

# 16. DATA CONNECTIONS

Implement connections as modular adapters.

First integration priority:

**Google Calendar**

If Calendar is stable and secure, consider Gmail/Drive.

Do not implement every integration just because it is possible.

Do not pay for WhatsApp/Telegram infrastructure for the MVP.

The user can always reflect through the website.

For OAuth:

- least privilege;
- explicit consent;
- protected refresh tokens;
- revocation;
- reconnect flow;
- per-source toggle.

For Google Photos, treat as stretch/future because its current APIs have separate OAuth, policy and quota requirements:
https://developers.google.com/photos

---

# 17. LIFE HORIZON VISUALIZATION

This is a defining part of the product.

Do NOT replace it with:

- generic dashboard cards;
- radar chart;
- single life score;
- decorative 3D scene with ambiguous meaning.

Implement:

- aligned longitudinal trajectories;
- shared time axis;
- domain rows;
- turning points;
- period selection;
- hover/tap details;
- evidence drilldown;
- accessible text summary.

The visualization should feel visually rich without sacrificing interpretability.

The user should be able to understand:

> “Career rose while energy declined.”

without decoding an unusual chart.

---

# 18. INVISIBLE PROGRESS

This is the most important proactive feature.

When evidence supports sustained positive change, surface it prominently.

Example:

> “You may not have noticed this.”

Then:

> “Your learning activity has become more consistent over the last six weeks.”

Show:

- time span;
- direction;
- evidence;
- optional comparison.

Do not invent Invisible Progress when evidence is weak.

---

# 19. WHAT CHANGED?

Implement period comparison.

User selects:

```text
March → September
```

System shows:

```text
Career       ↑↑
Learning     ↑
Health       →
Energy       ↓
```

Then explain the main changes with evidence.

Use meaningful animation to transition from one state to another.

---

# 20. TURNING POINTS

A turning point must represent a meaningful trajectory change, not an ordinary event.

Use candidate detection plus evidence.

Allow user to correct it.

---

# 21. DRIFT

Implement:

```text
stated priority
        VS
observed activity
```

Example:

> “Family remains an important stated priority, but recent activity suggests less time is reaching it.”

Use cautious language.

Do not moralize.

---

# 22. PREDICTIONS → OUTCOMES

Allow user to make a prediction attached to a decision or goal.

At the review point:

- retrieve relevant evidence;
- compare expected versus observed;
- show what matched;
- show what differed;
- let the user add reflection;
- update long-term pattern data.

Do not create a fake numeric “decision intelligence score” unless there is a genuine justified metric.

---

# 23. COLOR / DESIGN

Follow the visual direction in `MASTER_SPEC.md`.

Use:

- warm neutral base;
- deep indigo/blue identity;
- muted teal/green progress;
- warm amber for attention;
- muted coral/plum for decline;
- slate neutrals.

Never rely on color alone.

Respect WCAG 2.2 AA.

Support reduced motion.

Avoid bright red alarm aesthetics.

Avoid rainbow scales.

---

# 24. MOBILE

On mobile:

- Observatory remains the primary screen;
- preserve the time axis;
- allow horizontal interaction if necessary;
- use bottom-sheet details;
- prioritize one insight at a time;
- keep text concise.

Do not simply shrink the desktop layout.

---

# 25. UX STATES

Implement deliberately:

### Loading
Calm skeletons.

### Empty
Explain that evidence is still building.

### Sparse data
Say so instead of fabricating trends.

### Connection error
Explain reconnect steps.

### Gemini failure
Preserve the user's local input where safe.

### Auth expiry
Return cleanly to sign-in.

### Degraded source
Existing observatory continues functioning.

---

# 26. ACCESSIBILITY

Implement:

- keyboard support;
- visible focus;
- semantic labels;
- screen-reader summaries for visual insights;
- no color-only semantics;
- appropriate contrast;
- reduced motion;
- accessible touch targets.

For complex charts, provide an equivalent textual summary.

---

# 27. TESTING

Do not stop when the happy path works.

Create tests for:

## Authentication
- missing token;
- invalid token;
- valid login;
- session expiration.

## Authorization
- User A reading User B;
- User A writing User B;
- forged UID;
- ownership mutation.

## Firestore
- allowed own data;
- denied other user;
- invalid fields.

## Gemini
- malformed JSON;
- missing fields;
- provider failure;
- timeout;
- prompt injection text.

## Integrations
- expired OAuth;
- revoked access;
- provider failure;
- duplicate ingestion.

## UI
- empty state;
- loading state;
- error state;
- mobile layout;
- reduced-motion.

---

# 28. SECURITY TESTING SHOULD INCLUDE NEGATIVE CASES

At minimum implement a test or manual verification that demonstrates:

```text
User A
  ↓
attempts User B resource
  ↓
DENIED
```

Also verify:

```text
Client-supplied UID
    ≠
Verified Firebase UID
```

and the backend still uses the verified UID.

---

# 29. RATE LIMITS

Implement practical limits on:

- request body size;
- chat message size;
- daily/rolling Gemini requests;
- ingestion batch size;
- retries.

Do not let unauthenticated users consume expensive AI operations.

---

# 30. LOGGING

Never log:

- API keys;
- OAuth tokens;
- full journal entries;
- email bodies;
- Drive documents;
- secrets.

Use:

- request IDs;
- operation names;
- latency;
- sanitized errors;
- status codes.

---

# 31. PERFORMANCE

The observatory screen should not depend on a new Gemini generation.

Preferred:

```text
Firestore snapshots
      ↓
backend aggregation if needed
      ↓
frontend rendering
```

For a new reflection:

```text
persist
   ↓
process
   ↓
update
```

The user should get acknowledgement quickly.

Where practical, move deeper processing into background work.

---

# 32. DEPLOYMENT

Build a production container suitable for Cloud Run.

Verify:

- application listens on the expected Cloud Run port;
- HTTPS access;
- service account;
- Secret Manager access;
- environment configuration;
- CORS;
- auth;
- Firestore access;
- Gemini call.

Use the current official Cloud Run documentation for exact deployment syntax.

Verify the challenge-specific Cloud Run label from the current official codelab before final submission:

```text
dev-tutorial=cloud-run-ai-challenge
```

---

# 33. REPOSITORY

Ensure the repository is public and contains:

```text
README.md
SECURITY.md
firestore.rules
Dockerfile
client/
server/
tests/
docs/
```

At minimum include:

```text
docs/ai-studio/custom-instructions.md
docs/ai-studio/threat-model.md
docs/design-research.md
```

Do not commit secrets.

Add/update `.gitignore`.

---

# 34. README

README must be useful to both judges and engineers.

Include:

1. Product overview.
2. Why the product exists.
3. What makes it different.
4. Architecture diagram.
5. Gemini responsibilities.
6. Firestore model.
7. Firebase authentication.
8. Secret Manager.
9. Cloud Run deployment.
10. Connected source architecture.
11. Security model.
12. Local setup.
13. Testing.
14. Limitations.
15. Demo instructions.
16. AI Studio → GitHub → Antigravity workflow.

---

# 35. SECURITY DOCUMENTATION

`SECURITY.md` should explain:

- trust boundaries;
- authentication;
- authorization;
- Firestore isolation;
- secrets;
- OAuth;
- prompt injection;
- logging;
- deletion;
- rate limits;
- known limitations.

Do not claim a perfect security posture.

State what was implemented.

---

# 36. DESIGN RESEARCH DOCUMENT

`docs/design-research.md` should summarize why we chose:

- longitudinal time-series visualization;
- aligned position-based comparison;
- animation only for meaningful change;
- uncertainty display;
- minimal user prompting;
- evidence-based insights;
- accessible color encoding.

Cite:

- Visualized Self / personal-data reflection;
- Quantified Self insight types;
- self-tracking compliance/burden;
- progress monitoring;
- graphical perception;
- animated transitions;
- color-emotion evidence;
- uncertainty;
- WCAG.

Do not turn this into a long academic essay.

---

# 37. DO NOT INVENT RESEARCH CLAIMS

Never claim:

> “Our colors scientifically improve mental health.”

Never claim:

> “The Life Score is clinically accurate.”

Never claim:

> “The AI knows the user better than anyone.”

Keep the claims defensible.

---

# 38. BUILD PRIORITIES IF TIME RUNS SHORT

Protect this order:

```text
1. Authentication/security
2. Multi-turn Gemini
3. Reflection ingestion
4. Life Model
5. Life Horizon
6. Invisible Progress
7. Evidence
8. Cloud Run deployment
9. What Changed?
10. Turning Points
11. Drift
12. Prediction/outcome
13. Calendar
14. Other integrations
15. Extra polish
```

Do NOT cut the defining Life Observatory experience.

Cut stretch integrations before cutting the core product.

---

# 39. DO NOT GET DISTRACTED BY ARCHITECTURE THEATER

Do not add:

- multiple agents simply to sound advanced;
- unnecessary microservices;
- Kubernetes;
- message queues without a real need;
- databases beyond what the product needs;
- arbitrary vector databases;
- complex orchestration frameworks.

Use complexity only when it solves a real product/engineering problem.

The system can be sophisticated without being bloated.

---

# 40. NORMAL ENGINEERING JUDGMENT

You are allowed to:

- choose libraries;
- refactor;
- rename modules;
- choose exact API routes;
- select chart primitives;
- adjust schema details;
- select model variants;
- optimize implementation.

You are NOT allowed to casually remove:

- Life Observatory identity;
- evidence-backed insights;
- incremental processing;
- Firebase authentication;
- Firestore isolation;
- Secret Manager;
- Cloud Run;
- multi-turn Gemini;
- user privacy controls.

---

# 41. EXTERNAL DEPENDENCY FAILURES

If a cloud credential, OAuth approval, API enablement, or external account setting is unavailable:

1. implement everything else;
2. create the correct integration/configuration structure;
3. do not fake success;
4. write tests with mocks/fixtures where appropriate;
5. document exactly what remains;
6. continue building and verifying all independent functionality.

Do not repeatedly stop the entire build waiting for a single missing external setting.

---

# 42. FINAL VERIFICATION

Before finishing, independently verify:

## Product
- The app feels like Life Observatory, not an AI journal.
- The home view makes change understandable.
- Invisible Progress can be demonstrated.
- The companion is concise and contextual.

## AI
- Multi-turn works.
- Extraction is structured.
- Insight generation uses evidence.
- AI calls are incremental.

## Security
- Auth works.
- AuthZ works.
- Cross-user access is denied.
- Secrets are server-side.
- OAuth data is protected.
- Injection is handled.

## Data
- Firestore is user-scoped.
- Snapshot data persists.
- UI can operate without Gemini on every load.

## UX
- Desktop is polished.
- Mobile works.
- Empty/loading/error states exist.
- Accessibility works.

## Deployment
- Production build passes.
- Cloud Run deployment works.
- Public URL works.
- Repository is public.
- No secret is committed.

Run all available tests.

Run production build.

Fix failures rather than merely reporting them.

---

# 43. FINAL OUTPUT EXPECTATION

At completion, provide a concise implementation summary containing:

- what was built;
- what was tested;
- test/build results;
- deployment status;
- any genuinely remaining external configuration;
- key files changed.

Do not claim successful deployment or integration if it was not actually completed.

The objective is a working application, not a convincing report.

