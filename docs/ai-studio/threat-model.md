# Life Observatory — Threat Model & Security Posture

## 1. System Overview & Assets
- **Protected Assets**:
  - User private reflections, feelings, goals, decisions, and personal life trajectories.
  - Gemini API keys and Google OAuth tokens (Google Calendar).
  - Firestore life model document tree.
  - Cloud Run runtime environment.

## 2. Threat Vectors & Mitigations

### 2.1 Cross-User Data Access (IDOR / Spoofing)
- **Threat**: User A sends requests attempting to view or alter User B's reflections or insights by spoofing UID in request bodies or path params.
- **Mitigation**: 
  - Every backend request validates the Bearer Firebase ID token via `firebase-admin`.
  - The verified `token.uid` is the sole source of truth for authorization.
  - Any client-provided `userId` parameter is discarded or rejected if it does not match `req.user.uid`.
  - Cloud Firestore security rules enforce explicit path matching `/users/{uid}/...` with `request.auth.uid == uid`.

### 2.2 Indirect Prompt Injection via External Data
- **Threat**: An external calendar description or pasted text contains instructions designed to jailbreak Gemini, exfiltrate other data, or override instructions.
- **Mitigation**:
  - Semantic extraction prompts isolate untrusted input within XML-delimited `<user_untrusted_input>` blocks.
  - Strict system prompt rules instruct Gemini to interpret input strictly as user observation data.
  - Gemini outputs are constrained to strict JSON schemas; schema validation discards unexpected fields or instructions.

### 2.3 Secret Key Exposure
- **Threat**: Gemini API keys or OAuth refresh tokens leaked into client bundles, browser networks, or application logs.
- **Mitigation**:
  - Cloud Run fetches secrets at runtime from Google Cloud Secret Manager (`@google-cloud/secret-manager`).
  - No secrets are bundled into client build output (`Vite`).
  - Strict logging sanitizer strips authorization headers, token strings, and private text.

### 2.4 Denial of Wallet & Resource Exhaustion
- **Threat**: An attacker or rogue client script hammers Gemini generation endpoints, exhausting API credits.
- **Mitigation**:
  - Rate limiting enforced on all generative endpoints.
  - Maximum payload sizes enforced (e.g. 10KB reflection limit).
  - Incremental processing and deduplication fingerprints avoid re-calling Gemini when unchanged data is requested.
