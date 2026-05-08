// Types
import type { PlayerStore } from "@rbxts/lyra";
import type { Entity } from "@rbxts/jecs";

// Shared
import SharedReplecs from "@shared/replecs";
import Core from "@shared/core";
import API from "@shared/api";

export const PlayerRegistry = new Map<number, PlayerClass>();
export default class PlayerClass {
	private Store: PlayerStore<Type.Player.Data.Raw>;

	readonly Entity: Entity;

	readonly player: Player;
	readonly userId: number;

	constructor(player: Player, store: PlayerStore<Type.Player.Data.Raw>) {
		const { W, C, Replicator } = Core;

		this.player = player;
		this.userId = player.UserId;

		this.Entity = W.entity();
		W.add(this.Entity, C.Tags.Player);

		W.set(this.Entity, C.Player.UserId, this.userId);

		task.delay(2, () => {
			Replicator.server.set_networked(this.Entity, this.player);
			Replicator.server.set_reliable(this.Entity, C.Tags.Player);
			Replicator.server.set_reliable(this.Entity, C.Player.UserId);

			Replicator.server.register_custom_id(SharedReplecs.CustomIds.Player);
			Replicator.server.set_custom(this.Entity, SharedReplecs.CustomIds.Player);
		});

		this.Store = store;

		this.getFromStore().andThen((data) => {
			API.State.Player.set(this.player, data);
		});
	}

	protected async getFromStore() {
		await this.Store.loadAsync(this.player);
		return await this.Store.get(this.player);
	}

	public destroy() {
		const { W } = Core;

		W.delete(this.Entity);

		this.Store.unloadAsync(this.player);
	}
}
