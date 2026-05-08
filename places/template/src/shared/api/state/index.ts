// Packages
import { atom } from "@rbxts/charm";

// State
import PlayerState from "./player";

const Modules = {
	Player: PlayerState,
};

type StateModule = {
	Atom: ReturnType<typeof atom<any>>;
	getSourced: (...args: any[]) => any;
};
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
	? I
	: never;
type ExtractCtx<T> = T extends (ctx?: infer P) => any
	? Exclude<P, undefined>
	: T extends (ctx: infer P) => any
		? P
		: never;
type MergedCtx<T extends Record<string, StateModule>> = UnionToIntersection<
	NonNullable<{ [K in keyof T]: ExtractCtx<T[K]["getSourced"]> }[keyof T]>
>;

function extractAtoms<T extends Record<string, StateModule>>(modules: T) {
	const atoms = {} as { [K in keyof T as Lowercase<K & string>]: T[K]["Atom"] };
	for (const [key, mod] of pairs(modules)) {
		atoms[(key as string).lower() as keyof typeof atoms] = (mod as StateModule).Atom as never;
	}
	return atoms;
}

function extractSourced<T extends Record<string, StateModule>>(modules: T, ctx?: MergedCtx<T>) {
	const sourced = {} as { [K in keyof T]: ReturnType<T[K]["getSourced"]> };
	for (const [key, mod] of pairs(modules)) {
		sourced[key as keyof T] = (mod as StateModule).getSourced(ctx) as never;
	}
	return sourced;
}

const State = {
	...Modules,
	Sourced: (ctx?: MergedCtx<typeof Modules>) => extractSourced(Modules, ctx),
	Atoms: extractAtoms(Modules),
};

export default State;
