// Types
import type { Entity } from "@rbxts/jecs";

// Shared
import SharedReplecs from "@shared/replecs";
import PlayerNetwork from "./network";
import Core from "@shared/core";

export const PlayerRegistry = new Map<number, PlayerClass>();
export default class PlayerClass {
	public Network: PlayerNetwork;

	readonly Entity: Entity;

	readonly userId: number;

	constructor(player: Player) {
		const { W, C, Replicator } = Core;

		this.Entity = W.entity();
		W.add(this.Entity, C.Tags.Player);
		W.set(this.Entity, C.Player.UserId, player.UserId);

		Replicator.client.register_custom_id(SharedReplecs.CustomIds.Player);

		this.userId = player.UserId;
		this.Network = new PlayerNetwork(this);
	}

	public destroy() {
		const { W } = Core;

		W.delete(this.Entity);
	}
}
