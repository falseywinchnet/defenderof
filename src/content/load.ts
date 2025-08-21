import {
  EnemySchema,
  BossSchema,
  ItemSchema,
  ZoneSchema,
  StoreSchema,
  type Enemy,
  type Boss,
  type Item,
  type Zone,
  type Store,
} from './schema';

export interface GameContent {
  enemies: Record<string, Enemy>;
  bosses: Record<string, Boss>;
  items: Record<string, Item>;
  zones: Record<string, Zone>;
  stores: Record<string, Store>;
}

export async function loadContent(): Promise<GameContent> {
  const errors: string[] = [];

  const enemies: Record<string, Enemy> = {};
  const enemyModules = import.meta.glob('../../content/enemies/*.json', {
    eager: true,
    import: 'default',
  });
  for (const path in enemyModules) {
    const data = enemyModules[path] as unknown;
    const result = EnemySchema.safeParse(data);
    if (result.success) {
      enemies[result.data.id] = result.data;
    } else {
      const message = path + ': ' + result.error.message;
      errors.push(message);
    }
  }

  const bosses: Record<string, Boss> = {};
  const bossModules = import.meta.glob('../../content/bosses/*.json', {
    eager: true,
    import: 'default',
  });
  for (const path in bossModules) {
    const data = bossModules[path] as unknown;
    const result = BossSchema.safeParse(data);
    if (result.success) {
      bosses[result.data.id] = result.data;
    } else {
      const message = path + ': ' + result.error.message;
      errors.push(message);
    }
  }

  const items: Record<string, Item> = {};
  const itemModules = import.meta.glob('../../content/items/*.json', {
    eager: true,
    import: 'default',
  });
  for (const path in itemModules) {
    const data = itemModules[path] as unknown;
    const result = ItemSchema.safeParse(data);
    if (result.success) {
      items[result.data.id] = result.data;
    } else {
      const message = path + ': ' + result.error.message;
      errors.push(message);
    }
  }

  const zones: Record<string, Zone> = {};
  const zoneModules = import.meta.glob('../../content/zones/*.json', {
    eager: true,
    import: 'default',
  });
  for (const path in zoneModules) {
    const data = zoneModules[path] as unknown;
    const result = ZoneSchema.safeParse(data);
    if (result.success) {
      zones[result.data.id] = result.data;
    } else {
      const message = path + ': ' + result.error.message;
      errors.push(message);
    }
  }

  const stores: Record<string, Store> = {};
  const storeModules = import.meta.glob('../../content/store/*.json', {
    eager: true,
    import: 'default',
  });
  for (const path in storeModules) {
    const data = storeModules[path] as unknown;
    const result = StoreSchema.safeParse(data);
    if (result.success) {
      stores[result.data.id] = result.data;
    } else {
      const message = path + ': ' + result.error.message;
      errors.push(message);
    }
  }

  if (errors.length > 0) {
    const combined = errors.join('\n');
    throw new Error(combined);
  }

  return {
    enemies,
    bosses,
    items,
    zones,
    stores,
  };
}
