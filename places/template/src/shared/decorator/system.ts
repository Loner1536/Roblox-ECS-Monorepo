// shared/decorator/system.ts
import { RunService } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import { Phase } from "@rbxts/planck";
import Core from "@shared/core";

const { Scheduler, JabbyProfiler } = Core;

// ─── Args ─────────────────────────────────────────────────────────────────────

type SystemArgs = {
	W: typeof Core.W;
	C: typeof Core.C;

	JabbyProfiler: typeof Core.JabbyProfiler;
	Replicator: typeof Core.Replicator;
	Scheduler: typeof Core.Scheduler;
};

function makeArgs(): SystemArgs {
	return {
		W: Core.W,
		C: Core.C,

		JabbyProfiler: Core.JabbyProfiler,
		Replicator: Core.Replicator,
		Scheduler: Core.Scheduler,
	};
}

// ─── Base classes ─────────────────────────────────────────────────────────────

export interface Server extends SystemArgs {}
export abstract class Server {
	readonly intervals?: Record<string, number>;
	constructor(args: SystemArgs) {
		Object.assign(this, args);
	}
	onStartup?(): void;
	onUpdate?(dt: number): void;
}

export interface Client extends SystemArgs {}
export abstract class Client {
	readonly intervals?: Record<string, number>;
	constructor(args: SystemArgs) {
		Object.assign(this, args);
	}
	onStartup?(): void;
	onUpdate?(dt: number): void;
}

export interface Shared extends SystemArgs {}
export abstract class Shared {
	readonly intervals?: Record<string, number>;
	constructor(args: SystemArgs) {
		Object.assign(this, args);
	}
	onStartup?(): void;
	onClientStartup?(): void;
	onServerStartup?(): void;
	onUpdate?(dt: number): void;
	onClientUpdate?(dt: number): void;
	onServerUpdate?(dt: number): void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SystemConstructor = new (args: SystemArgs) => Server | Client | Shared;
export type SystemKind = "Server" | "Client" | "Shared";

export type Entry = {
	instance: Server | Client | Shared;
	category: string;
	name: string;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const SystemRegistry = new Map<string, Entry>();

export default function System(category: string, name: string) {
	return function <T extends SystemConstructor>(constructor: T) {
		const instance = new constructor(makeArgs());

		const id = `${category}/${name}`;
		if (SystemRegistry.has(id))
			error(`Duplicate system registered | name: ${name} category: ${category}`, 2);

		SystemRegistry.set(id, { instance, category, name });
	};
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

export function bootSystems() {
	const UpdatePhase = new Phase("Update");
	Scheduler.insert(UpdatePhase, RunService, "Heartbeat");

	const isClient = RunService.IsClient();
	const isServer = RunService.IsServer();

	for (const [, entry] of SystemRegistry) {
		const instance = entry.instance;

		if ("onStartup" in instance) instance.onStartup!();
		if (isClient && "onClientStartup" in instance) instance.onClientStartup!();
		if (isServer && "onServerStartup" in instance) instance.onServerStartup!();

		const label = entry.name;

		if ("onUpdate" in instance) {
			const id = JabbyProfiler.EnsureSystem(label, entry.category);
			Scheduler.addSystem(
				() => JabbyProfiler.Run(id, () => instance.onUpdate!(Scheduler.getDeltaTime())),
				UpdatePhase,
			);
		}

		if (isClient && "onClientUpdate" in instance) {
			const id = JabbyProfiler.EnsureSystem(label, entry.category);
			Scheduler.addSystem(
				() => JabbyProfiler.Run(id, () => instance.onClientUpdate!(Scheduler.getDeltaTime())),
				UpdatePhase,
			);
		}

		if (isServer && "onServerUpdate" in instance) {
			const id = JabbyProfiler.EnsureSystem(label, entry.category);
			Scheduler.addSystem(
				() => JabbyProfiler.Run(id, () => instance.onServerUpdate!(Scheduler.getDeltaTime())),
				UpdatePhase,
			);
		}

		if (instance.intervals) {
			const id = JabbyProfiler.EnsureSystem(label, entry.category);
			for (const [method, rate] of pairs(instance.intervals)) {
				if (method in instance) {
					let accumulator = 0;
					Scheduler.addSystem(() => {
						accumulator += Scheduler.getDeltaTime();

						if (accumulator >= 1 / rate) {
							accumulator = 0;
							const fn = (instance as unknown as Record<string, unknown>)[method];

							if (typeIs(fn, "function")) {
								JabbyProfiler.Run(id, () => fn(instance, Scheduler.getDeltaTime()));
							}
						}
					}, UpdatePhase);
				}
			}
		}
	}
}
