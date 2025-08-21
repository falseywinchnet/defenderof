# AGENTS.MD — Build Orchestration Guide

This file instructs an autonomous coding agent (e.g., Codex) how to proceed in **small, verifiable chunks**, using the five design docs as source-of-truth. It defines workflow, task checklists with IDs, acceptance criteria, and how to record progress in `completion.txt` and `notes.txt`.

---

## 0) Mission Snapshot
- **Goal:** Ship an MVP vertical slice (Zone One: Picnic Table + Kitchen), then iterate through Arc 1 → Arc 2 as time permits.
- **Sources of Truth:**
  1. `Defender Overview` (Document 1)
  2. `Game Progression` (Document 2)
  3. `Gameplay Systems` (Document 3)
  4. `Story Themes` (Document 4)
  5. `Technical Design` (Document 5)

*(Assumption: the model has read-access to these 5 files in the repo.)*

---

## 1) Operating Principles
- **Small Chunks:** Work in increments that can be completed and verified quickly.
- **Data-Driven:** Prefer adding content via JSON + schema over hardcoding.
- **Deterministic Core:** Seeded RNG; stable tunables via `tuning.json`.
- **Fail Fast, Log Clearly:** On load, validate all JSON and display human-readable errors.
- **UI First, Pretty Later:** Functional rectangles/hitboxes now; visuals can improve after M0.
- **No Dead Code:** If code is scaffolded, wire a minimal usage or remove it.
- **Tests-by-Usage:** Manual smoke tests with clear acceptance criteria per task.

---

## 2) Workflow Loop
1. **Pick next unchecked task (lowest ID first).**
2. **Implement** the task in a focused PR/commit.
3. **Run local build**, verify acceptance criteria.
4. **Mark completion** in `completion.txt` using the format below.
5. **Leave findings** (edge cases, questions, follow-ups) in `notes.txt`.
6. **Repeat** until all M0 tasks are `DONE`.

**`completion.txt` line format:**
```
[TASK_ID] STATUS YYYY-MM-DD HH:MM - short note
```
- `STATUS` ∈ {`DONE`, `BLOCKED`, `N/A`}
- Example: `M0-03 DONE 2025-08-20 14:05 - Render loop draws HUD counters`

**`notes.txt` guidance:**
- Use short bullet points per TASK_ID.
- Include repro steps for any bug and a proposed fix.

---

## 3) Repo Setup Conventions
- **Build:** Vite + TypeScript, Canvas 2D (per Technical Design).
- **Structure:** As outlined in Document 5 (engine/, systems/, state/, ui/, content/ etc.).
- **Commits:** `feat(M0-XX): message`, `fix(M0-XX): message`, `refactor(M0-XX): message`.
- **Lint/Format:** ESLint + Prettier, strict TS.

---

## 4) Task Checklist — M0 Vertical Slice (Zone One)
**Scope targets:** The Picnic Table (core) + Kitchen (unlock after boss). Store (Tape, Match), Pester Parents, Attack Flies, Tick Boss, Enraged Flies, HUD, Save/Load.

### Boot & Infrastructure
- [ ] **M0-01**: Initialize Vite + TypeScript project; configure ESLint/Prettier; strict TS.
- [ ] **M0-02**: Create Canvas bootstrap (`index.html`, `main.ts`); set up game loop (update/draw, deltaTime).
- [ ] **M0-03**: Implement `engine/game.ts` (scene switching), `engine/render.ts` helpers, seeded RNG.
- [ ] **M0-04**: Implement global `state/gameState.ts` with interfaces from Document 5.

### Content & Validation
- [ ] **M0-05**: Add `content/schema.ts` (Zod validators for Enemy/Item/Action/Pester/Boss/Zone/Store).
- [ ] **M0-06**: Create `content/zones/picnic_table.json`, `content/items/*.json`, `content/enemies/*.json`, `content/store/zone1_store.json`, `tuning.json` (initial values from docs).
- [ ] **M0-07**: Content loader + validator; fail gracefully with readable overlay if invalid.

### Systems
- [ ] **M0-08**: `systems/combat.ts` — single-target/group attack, damage calc, bounty, kill feed.
- [ ] **M0-09**: `systems/pester.ts` — weighted increments (1/2/3), obliviousness (0), threshold unlock.
- [ ] **M0-10**: `systems/economy.ts` — currency increments, store purchases, durability repair.
- [ ] **M0-11**: `systems/progression.ts` — unlock boss at 100 fly kills; lock boss after victory; zone unlock to Kitchen.
- [ ] **M0-12**: Cooldown manager (per-action cooldowns; UI disabling logic).
- [ ] **M0-13**: Enraged Flies logic — rolling 1s window; >6 kills/sec ⇒ 5s enraged (HP×2, 2-click requirement).

### UI & Interaction
- [ ] **M0-14**: HUD (HP, currency, zone name) + debug overlay (FPS, flags, enraged timer).
- [ ] **M0-15**: Action bar buttons (Attack Flies, Pester Parents, Fight Tick); cooldown visualization.
- [ ] **M0-16**: Store panel (Tape, Match); inventory panel; simple confirmation for purchases.
- [ ] **M0-17**: Zone map (two nodes: Picnic Table ↔ Kitchen) — click to travel when unlocked.

### Persistence & QA
- [ ] **M0-18**: Save/Load to localStorage (slots), versioned payload; migration stub.
- [ ] **M0-19**: Manual smoke tests checklist (see below) and bug fixes.
- [ ] **M0-20**: Balance pass: cooldowns/damage match Document 3; tune until playable.

**Exit Criteria for M0**
- Player can **pester parents** to unlock **flyswatter**.
- **Attack Flies** has 8s CD before swatter, 0.1s after; flies drop 1 penny.
- **Boss: Bloodsucking Tick** unlocks at 100 fly kills; requires **Match** (2 uses × 250 dmg).
- **Tape** repairs flyswatter by 100 durability.
- **Kitchen** unlocks after Tick defeat. Save/Load works. Basic HUD + store.

---

## 5) Task Checklist — M1 Arc 1 Completion (Post-M0)
*(Begin only after all M0 tasks are `DONE`.)*
- [ ] **M1-01**: Add remaining Arc 1 zones/items/enemies per Document 2.
- [ ] **M1-02**: Implement Horn + upgraded tools behavior.
- [ ] **M1-03**: Add Pester Trapper event; related boss gates.
- [ ] **M1-04**: Add DoT/status effects for spiders/wolves per Document 3.
- [ ] **M1-05**: First-pass animations/SFX.

---

## 6) Manual Smoke Tests (for M0-19)
- [ ] **T-01**: Boot with valid JSON → no overlay errors.
- [ ] **T-02**: Corrupt a required field (e.g., enemy hp) → overlay shows validation error path.
- [ ] **T-03**: Attack Flies before swatter → 8s cooldown; after swatter → 0.1s.
- [ ] **T-04**: Earn pennies; purchase Tape and Match; Tape repairs durability.
- [ ] **T-05**: Kill 100 flies → Tick boss appears; without Match → boss immune.
- [ ] **T-06**: Use 2 Match charges → Tick defeated; Kitchen unlocks.
- [ ] **T-07**: Save, reload page → state restored.

---

## 7) Coding Standards
- **TypeScript strict**; no `any` unless justified in `notes.txt`.
- **Modules**: one purpose per file; short functions; descriptive types.
- **Errors**: throw with context (file/key) for content parsing.
- **UI**: Keyboard/touch parity for actions.

---

## 8) Completion & Notes Templates
**Append to `completion.txt`** as tasks complete:
```
M0-01 DONE 2025-08-20 12:34 - Vite+TS scaffold w/ ESLint/Prettier
M0-02 DONE 2025-08-20 12:55 - RAF loop + deltaTime working
M0-03 BLOCKED 2025-08-20 13:10 - Need decision on scene API
...
```

**Append to `notes.txt`** with findings/questions:
```
- M0-03: Consider simple enum Scene { Menu, Game, Map } for switcher.
- M0-06: Do we want per-zone tuning overrides? Proposed schema key: zone.tuning.
- M0-13: Enraged window should be clamped to 5s; verify behavior if kills cease.
```

---

## 9) Risk & Rollback
- If content validation fails: disable Start and show overlay with first 5 errors.
- If a task expands in scope: split into sub-IDs (e.g., M0-10a) and document in `notes.txt`.

---

## 10) Next Action
Start with **M0-01** and proceed sequentially. After each task, update `completion.txt` and `notes.txt`. Once all **M0** tasks are `DONE`, surface `notes.txt` for review and planning of M1.

