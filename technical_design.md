# Defender Of: The Video Game

## Document 5: Technical Design / Implementation Plan

This document defines the **stack, architecture, data schemas, and implementation plan** to build a browser-based .io-style game using **HTML5 Canvas** and **JSON-driven content**.

---

## 🧱 Tech Stack & Principles
- **Language:** TypeScript (strict mode) for type safety.
- **Runtime:** Web (no installs).
- **Renderer:** HTML5 **Canvas 2D** API (single canvas). Optional: swap to **PixiJS** later for batching/filters.
- **Bundler/Dev:** **Vite** (fast HMR, ESM).
- **Data:** Game content in **JSON** files (zones, enemies, items). Versioned and validated at load.
- **Audio:** Web Audio API (simple SFX cues).
- **Persistence:** `localStorage` (save slots + versioning). Optional: IndexedDB for larger assets.
- **Net (future .io):** Socket.io or Colyseus (authoritative server) — not required for the single-player MVP.

Design principle: **Data-driven**. Adding a new zone or enemy requires **only JSON changes**.

---

## 🗂 Project Structure
```
/defender-of
  /public
    index.html
  /src
    main.ts            // boot, asset + data load, start Game
    engine/
      game.ts          // loop (update/draw), time, scene switching
      input.ts         // click/tap, keybinds, hit-testing
      render.ts        // canvas drawing helpers
      rng.ts           // seeded RNG utilities
    systems/
      combat.ts        // damage, cooldowns, enraged logic
      pester.ts        // pester meter logic
      economy.ts       // currency, store transactions
      progression.ts   // unlocks, flags, boss gates
      save.ts          // save/load, versioning
    state/
      types.ts         // shared types/interfaces
      gameState.ts     // global state store
    ui/
      hud.ts           // meters, currency, cooldown bars
      sceneMap.ts      // node-based zone navigation (“drug-dealer map”)
      buttons.ts       // action buttons
    content/
      schema.ts        // zod validators for JSON content
      zones/           // zone JSON files
      items/           // items JSON
      enemies/         // enemies JSON
  /assets
    sfx/, images/
  vite.config.ts
```

---

## 🧬 Core Data Schemas (JSON)
*(TS interfaces + Zod validators in `content/schema.ts`)*

**Enemy**
```json
{
  "id": "fly",
  "name": "Fly",
  "hp": 8,
  "damagePerHit": 0,
  "onHitPlayer": { "flat": 0, "dot": 0 },
  "bounty": { "pennies": 1 },
  "tags": ["swarm", "bug"],
  "behaviors": { "enragedMultiplier": 2 }
}
```

**Item**
```json
{
  "id": "flyswatter",
  "name": "Flyswatter",
  "type": "weapon",
  "damage": 8,
  "cooldownMs": 100,
  "durability": 200,
  "consumable": false,
  "requirements": [],
  "effects": {}
}
```

**Action** (for UI buttons like Attack, Pester)
```json
{
  "id": "attack_flies",
  "label": "Attack Flies",
  "cooldownMs": 8000,
  "requires": ["zone:picnic_table"],
  "exec": "combat.attackGroup",
  "params": { "enemyId": "fly" },
  "postUnlock": { "onItemOwned": "flyswatter", "newCooldownMs": 100 }
}
```

**Pester**
```json
{
  "id": "pester_parents",
  "target": "Parents",
  "threshold": 40,
  "increments": { "1": 0.5, "2": 0.25, "3": 0.125 },
  "reward": { "grantItem": "flyswatter" }
}
```

**Boss**
```json
{
  "id": "tick_boss",
  "name": "Bloodsucking Tick",
  "hp": 500,
  "immunities": ["physical"],
  "requiredItems": ["match"],
  "rewards": { "unlock": ["zone:kitchen"], "currency": { "pennies": 50 } }
}
```

**Store**
```json
{
  "id": "zone1_store",
  "inventory": [
    { "itemId": "tape", "price": { "pennies": 25 } },
    { "itemId": "match", "price": { "cents": 50 }, "lockedUntil": "boss:tick_boss" }
  ]
}
```

**Zone**
```json
{
  "id": "picnic_table",
  "name": "The Picnic Table",
  "enemies": ["fly"],
  "items": ["flyswatter", "match"],
  "actions": ["pester_parents", "attack_flies", "fight_tick"],
  "store": "zone1_store",
  "bosses": ["tick_boss"],
  "rewards": { "unlock": ["zone:kitchen"] }
}
```

---

## 🧠 Game State Model
```ts
interface PlayerState {
  hp: number; maxHp: number;
  inventory: Record<string, number>; // itemId -> qty/durability
  cooldowns: Record<string, number>; // actionId -> ms remaining
  currency: { pennies: number; cents: number; dollars: number };
  flags: Record<string, boolean>; // e.g., "boss:tick_boss:cleared"
}

interface WorldState {
  currentZoneId: string;
  zonesCleared: Record<string, boolean>;
  pester: Record<string, { value: number; unlocked: boolean }>;
  killFeed: Array<{ enemyId: string; ts: number }>; // for Enraged checks
}

interface SaveGame { version: string; player: PlayerState; world: WorldState; }
```

---

## ⏱ Loop & Timing
- Use `requestAnimationFrame` for the **render loop** (60 FPS target) and a fixed **update step** (e.g., 16ms).
- Maintain `deltaTime` for cooldowns, DoTs, and pester decay (if any).
- All actions gate through a **cooldown map**. UI disables actions while `cooldown > 0`.

**Game Loop (pseudocode)**
```
init():
  loadAssets();
  loadContentJSON(); // validate via zod
  state = newGameOrLoad();
  startLoop();

loop(dt):
  input.poll();
  systems.cooldowns.update(dt);
  systems.combat.update(dt);      // DoTs, enemy timers
  systems.progression.update(dt); // unlocks, boss gates
  systems.economy.update(dt);     // passive income if any
  render.draw(state);             // canvas 2D
```

---

## 🥊 Combat Details
- **Attacks:** resolve immediately if target group exists in current zone.
- **Damage:** `finalDamage = baseDamage * itemMultipliers * enragedModifier`.
- **Enraged Flies (example):**
  - Track **kills/second** with a rolling 1s window.
  - If `killsPerSecond > 6`, flag `enraged` for `fly` for 5s: HP ×2, 2-click requirement.
- **Boss Immunity Gate:** Boss may be immune to certain damage types until required item is consumed.

**Example Resolution**
```
if (action == attack_flies) {
  if (ownItem("flyswatter")) cooldown=100ms; else cooldown=8000ms;
  killOne("fly");
  dropCurrency({ pennies: 1 });
  recordKill("fly");
  checkEnraged("fly");
}
```

---

## 🧰 Pester System Details
- **Meter:** integer 0 → threshold (e.g., 40).
- **Click Increments:** RNG outcome per click using weighted probabilities {1:50%, 2:25%, 3:12.5%}. (Remaining 12.5% yields 0 to capture “obliviousness”.)
- **Rewards:** on reaching threshold, grant item or permission flag; excess clicks have no effect.
- **UI:** big humorous button, progress bar, flavor text.

---

## 🛒 Store & Economy
- **Currency Tiers:** pennies (Arc 1) → cents/dollars (later arcs). Conversion rules can be explicit in economy.
- **Inventory:** stackable consumables (`match`), durability for tools (`flyswatter` repaired by `tape`).
- **Locks:** items may be `lockedUntil` certain flags (e.g., boss revealed).
- **Transactions:** fail-safe with preview: cost, new balance, and requirements all shown.

---

## 🖥 UI Plan (Canvas-First)
- **HUD (top):** HP, currency, current zone.
- **Center:** enemy silhouettes/icons, simple hitboxes for clicking.
- **Bottom Action Bar:** buttons for `Attack`, `Pester`, `Use Item`, cooldown rings.
- **Right Panel:** Store tab, Inventory tab, Zone Info tab.
- **Map Screen:** node graph of zones (click to travel when unlocked), mirroring the classic “drug-dealer” map flow.

---

## 🔐 Save/Load
- **Format:** JSON `SaveGame` with `version` and `checksum`.
- **Slots:** `save:slot:1`, `save:slot:2`, etc.
- **Migration:** `contentVersion` + simple upgrader on load.

---

## 🧪 Dev Tooling
- **Debug Overlay:** FPS, dt, current flags, pester value, enraged timer.
- **Content Lint:** validate all JSON on boot; show meaningful error with file and path.
- **Tunable Values:** balancing constants in a single `tuning.json`.

---

## 🎯 MVP Scope & Milestones
**M0 – Vertical Slice (Zone One)**
- Picnic Table + Kitchen
- Actions: Attack Flies, Pester Parents, Fight Tick (boss)
- Store: Tape, Match (locked until boss)
- Enraged flies, cooldowns, durability, basic HUD, save

**M1 – Arc 1 Complete**
- Zones 1–9 content JSON
- Items (slipper/newspaper/boot/horn) + upgrades
- Boss gates and pester events (Trapper)

**M2 – Arc 2 Framework**
- Currency expansion (cents/dollars)
- Societal enemies, office/club scenes
- Mayor/Governor pester events

**M3 – Polish & Effects**
- SFX cues, simple animations, better hitboxes
- Responsive layout (desktop first; mobile tap targets)

---

## 📦 Example Content — Zone One (Picnic Table)
```json
{
  "id": "picnic_table",
  "name": "The Picnic Table",
  "enemies": ["fly"],
  "actions": ["pester_parents", "attack_flies", "fight_tick"],
  "store": "zone1_store",
  "bosses": ["tick_boss"],
  "rewards": { "unlock": ["zone:kitchen"] }
}
```

**Notes**
- `fight_tick` appears after 100 fly kills and requires owning `match` (2 uses; 250 dmg each). After victory, the boss is locked again until a later zone.

---

## ✅ Implementation Notes
- Keep **content deterministic** with a seeded RNG so balancing is reproducible.
- Decouple **update** from **render**; favor simple rectangles and iconography initially.
- Treat every new feature as **data-first** (add JSON + schema + small system hook).

