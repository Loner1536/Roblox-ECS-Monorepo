const reservedHashes = new Map<number, string>();

export type HashType = "u8" | "u16" | "u32" | "i8" | "i16" | "i32";
type HashResult<T extends HashType> = T extends "u8"
	? number
	: T extends "u16"
		? number
		: T extends "u32"
			? number
			: T extends "i8"
				? number
				: T extends "i16"
					? number
					: T extends "i32"
						? number
						: never;

const TYPE_META: Record<HashType, { bits: number; signed: boolean; fold: boolean }> = {
	u8: { bits: 8, signed: false, fold: false },
	u16: { bits: 16, signed: false, fold: true },
	u32: { bits: 32, signed: false, fold: false },
	i8: { bits: 8, signed: true, fold: false },
	i16: { bits: 16, signed: true, fold: true },
	i32: { bits: 32, signed: true, fold: false },
};

function fnv1a32(str: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < str.size(); i++) {
		hash = bit32.bxor(hash, string.byte(str, i + 1, i + 1)[0]);
		hash = bit32.band(hash * 0x01000193, 0xffffffff);
	}
	return hash;
}

export default function Hash<T extends HashType>(str: string, as: T): HashResult<T> {
	const meta = TYPE_META[as];
	let h = fnv1a32(str);

	if (meta.fold) {
		h = bit32.bxor(bit32.rshift(h, 16), bit32.band(h, 0xffff));
	}

	const mask = meta.bits === 32 ? 0xffffffff : (1 << meta.bits) - 1;
	h = bit32.band(h, mask);

	if (meta.signed) {
		const signBit = 1 << (meta.bits - 1);
		if (h >= signBit) h -= signBit * 2;
	}

	return h as HashResult<T>;
}

export function reserveHashes(hash: number, reason: string) {
	const existing = reservedHashes.get(hash);
	assert(
		existing === undefined,
		`[API] 0x${string.format("%04x", hash)} is already reserved by "${existing}"`,
	);
	reservedHashes.set(hash, reason);
}

export function isReserved(hash: number) {
	return reservedHashes.has(hash);
}

export function getReason(hash: number) {
	return reservedHashes.get(hash);
}

export function toHash<T extends Hashes>(key: string, _brand: T, as: HashType = "u16"): Hash<T> {
	const hash = Hash(key, as);

	const reason = getReason(hash);
	assert(
		reason === undefined,
		`[fnv1a] "${key}" hashed to reserved value ${hash} (0x${string.format("%08x", hash)}): "${reason}"`,
	);

	return hash as Hash<T>;
}

export function createRegistry<B extends Hashes, T extends object>(brand: B, as: HashType = "u16") {
	const map = new Map<Hash<B>, BrandedHash<B, T>>();

	function register(key: string, template: T) {
		const hash = toHash(key, brand, as);
		assert(!map.has(hash), `[${brand}] collision: "${key}" collides with existing entry`);

		const brandKey = `${brand.sub(1, 1).lower()}${brand.sub(2)}`;
		const def = { ...template, [brandKey]: hash, key } as BrandedHash<B, T>;
		map.set(hash, def);
	}

	function get(hash: Hash<B>) {
		const def = map.get(hash);
		if (!def) return false;
		return def;
	}

	function fromKey(key: string): BrandedHash<B, T> {
		const def = get(toHash(key, brand, as));
		if (!def) throw `[${brand}] Unknown key: ${key} for brand: ${brand}`;
		return def;
	}

	return { map, register, get, fromKey };
}
