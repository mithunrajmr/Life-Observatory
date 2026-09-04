# Data Pipeline Architecture

## The Three-Layer Intelligence Engine

Life Observatory decouples raw observation processing, persistent state accumulation, and AI insight generation into three clearly defined stages:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Life Ingestion Engine ("What happened?")                  │
│    - Daily reflection text                                  │
│    - Google Calendar events (via adapter)                   │
│    - Multi-turn conversation turns                          │
│    - Schema-constrained extraction using Gemini Flash-Lite   │
│    - Produces normalized candidate events with provenance   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Life Model Engine ("What does the accumulated state show?")│
│    - Deterministic time-series ordering and domain binning  │
│    - Rolling momentum & trajectory calculations             │
│    - Turning-point candidate tagging                        │
│    - Goal drift comparison (stated priorities vs. events)   │
│    - Snapshot generation (materialized chart coordinates)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Insight Engine ("Is there meaningful change to see?")    │
│    - Insight Eligibility Gate:                              │
│        * Minimum evidence threshold (>2 distinct events)    │
│        * Conflict detection (contradictory signals)         │
│        * Time window significance (>2 weeks duration)       │
│    - Deduplication Fingerprinting                           │
│    - Deep synthesis using Gemini Flash:                     │
│        * Invisible Progress discovery                       │
│        * "What Changed?" period transitions                 │
│        * Evidence attribution linking                       │
└─────────────────────────────────────────────────────────────┘
```

## Cost and Latency Protections
1. **Incremental Processing**: Only new reflections or un-ingested calendar items are sent to Gemini.
2. **Deterministic Horizon**: The Life Horizon visualization renders purely from pre-calculated snapshot coordinates, never invoking an LLM on page load.
3. **Evidence Requirement**: Insights are only synthesized when eligibility rules pass.
