// Packages
import Object from "@rbxts/object-utils";

// Shared
import { createRegistry } from "@shared/api/hash";

// ─── Flat (single-level) ─────────────────────────────────────────────────────
export function createFlatRegistry<H extends Hashes, T extends object, E extends Record<string, T>>(
	hashName: H,
	entries: E,
) {
	const registry = createRegistry<H, T>(hashName);
	const seen = new Set<string>();
	const rawEntries = {} as Record<string, T>;

	for (const [key, template] of Object.entries(entries) as Array<[string, T]>) {
		assert(!seen.has(key), `[Registry] Duplicate key "${key}" in ${hashName}`);
		seen.add(key);
		registry.register(key, template);
		rawEntries[key] = template;
	}

	type EntryKey = keyof E & string;

	return {
		Map: registry.map,
		Entries: rawEntries as Record<EntryKey, T>,
		get: (hash: Hash<H>) => registry.get(hash),
		fromKey: (key: EntryKey) => registry.fromKey(key as string),
	};
}

// ─── Categorized (two-level, "Cat.Key") ──────────────────────────────────────
export function createCategoryRegistry<
	H extends Hashes,
	C extends Record<string, Record<string, object>>,
>(hashName: H, categories: C) {
	type CategoryKey = keyof C & string;
	type FullKey = {
		[K in CategoryKey]: `${K}.${keyof C[K] & string}`;
	}[CategoryKey];
	type EntryType = C[CategoryKey][keyof C[CategoryKey]];

	const registry = createRegistry<H, EntryType>(hashName);
	const seen = new Set<string>();
	const rawEntries = {} as Record<string, EntryType>;

	for (const [cat, templates] of Object.entries(categories) as Array<
		[string, Record<string, EntryType>]
	>) {
		for (const [key, template] of Object.entries(templates) as Array<[string, EntryType]>) {
			const full = `${cat}.${key}`;
			assert(!seen.has(full), `[Registry] Duplicate key "${full}" in ${hashName}`);
			seen.add(full);
			registry.register(full, template);
			rawEntries[full] = template;
		}
	}

	return {
		Map: registry.map,
		Entries: rawEntries as Record<FullKey, EntryType>,
		get: (hash: Hash<H>) => registry.get(hash),
		fromKey: (key: FullKey) => registry.fromKey(key as string),
	};
}
