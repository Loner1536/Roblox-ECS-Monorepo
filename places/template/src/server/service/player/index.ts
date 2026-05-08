// Packages
import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

// Utility
import safePlayerAdded from "@global/shared/util/safe.player.added";

// Services
import StoreService from "../store";

// Classes
import PlayerClass, { PlayerRegistry } from "@server/class/player";

@Service({ loadOrder: 2 })
export default class PlayerService implements OnStart {
	constructor(private StoreService: StoreService) {}

	onStart(): void {
		safePlayerAdded(async (player) => {
			const playerClass = new PlayerClass(player, this.StoreService.store);
			PlayerRegistry.set(player.UserId, playerClass);
		});

		Players.PlayerRemoving.Connect((player) => {
			const playerClass = PlayerRegistry.get(player.UserId);
			if (!playerClass) return;

			PlayerRegistry.delete(player.UserId);
			playerClass.destroy();
		});
	}
}
