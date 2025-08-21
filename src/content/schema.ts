import { z } from 'zod';

export const CurrencySchema = z.object({
  pennies: z.number().int().nonnegative().optional(),
});

export const EnemySchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number().nonnegative(),
  damagePerHit: z.number().nonnegative(),
  onHitPlayer: z.object({
    flat: z.number().nonnegative(),
    dot: z.number().nonnegative(),
  }),
  bounty: CurrencySchema,
  tags: z.array(z.string()),
  behaviors: z
    .object({
      enragedMultiplier: z.number().nonnegative().optional(),
    })
    .partial()
    .optional(),
});

export type Enemy = z.infer<typeof EnemySchema>;

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  damage: z.number(),
  cooldownMs: z.number(),
  durability: z.number().optional(),
  consumable: z.boolean(),
  requirements: z.array(z.string()),
  effects: z.record(z.any()).optional(),
});

export type Item = z.infer<typeof ItemSchema>;

export const ActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  cooldownMs: z.number(),
  requires: z.array(z.string()),
  exec: z.string(),
  params: z.record(z.any()).optional(),
  postUnlock: z
    .object({
      onItemOwned: z.string().optional(),
      newCooldownMs: z.number().optional(),
    })
    .optional(),
});

export type Action = z.infer<typeof ActionSchema>;

export const PesterSchema = z.object({
  id: z.string(),
  target: z.string(),
  threshold: z.number(),
  increments: z.object({
    '1': z.number(),
    '2': z.number(),
    '3': z.number(),
    '0': z.number().optional(),
  }),
  reward: z.object({ grantItem: z.string().optional() }).optional(),
});

export type Pester = z.infer<typeof PesterSchema>;

export const BossSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    hp: z.number(),
    immunities: z.array(z.string()),
  })
  .catchall(z.any());

export type Boss = z.infer<typeof BossSchema>;

const ZoneRewardsSchema = z.object({
  unlock: z.array(z.string()),
});

export const ZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  enemies: z.array(z.string()),
  actions: z.array(z.string()),
  store: z.string(),
  bosses: z.array(z.string()),
  rewards: ZoneRewardsSchema.optional(),
});

export type Zone = z.infer<typeof ZoneSchema>;

const StoreItemSchema = z.object({
  itemId: z.string(),
  cost: CurrencySchema,
  lockedUntil: z.string().optional(),
});

export const StoreSchema = z.object({
  id: z.string(),
  items: z.array(StoreItemSchema),
});

export type Store = z.infer<typeof StoreSchema>;
