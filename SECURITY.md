# Life Observatory Security Policy

## Security Architecture Summary

Life Observatory implements a defense-in-depth security model:

1. **Authentication & Identity**:
   - All client-to-backend communication requires a valid Firebase Authentication ID Token passed as an `Authorization: Bearer <token>` header.
   - The backend validates tokens using `firebase-admin` and establishes `req.user.uid` as the unforgeable identity.
   - Client-provided `userId` or `uid` query/body parameters are strictly ignored.

2. **Database Isolation**:
   - Cloud Firestore documents reside in user-scoped subcollections under `/users/{uid}/...`.
   - Firestore security rules strictly forbid wildcard recursive access and require `request.auth.uid == uid`.
   - Server-side business logic independently verifies ownership before any Firestore operation.

3. **Secrets Management**:
   - Production Cloud Run environments read the Gemini API key from Google Cloud Secret Manager via runtime identity (`roles/secretmanager.secretAccessor`).
   - No API keys or service credentials are built into client bundles or checked into source control.

4. **Prompt Injection Defense**:
   - Untrusted inputs (reflections, calendar summaries, messages) are bounded within isolation delimiters.
   - System prompts explicitly command Gemini to treat user content as data, not instruction.
   - All structured model outputs are validated against TypeScript schemas before database writes.

5. **Reporting a Vulnerability**:
   - If you discover a security issue, please contact the maintainers directly through private repository vulnerability reporting or email rather than public issue trackers.
