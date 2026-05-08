// Packages
import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

// Classes
import PlayerClass, { PlayerRegistry } from "@client/class/player";

@Controller({ loadOrder: 1 })
export default class PlayerService implements OnStart {
	onStart(): void {
		const player = Players.LocalPlayer;

		const playerClass = new PlayerClass(player);
		PlayerRegistry.set(player.UserId, playerClass);

		Players.PlayerRemoving.Connect((player) => {
			const playerClass = PlayerRegistry.get(player.UserId);
			if (!playerClass) return;

			playerClass.destroy();
			PlayerRegistry.delete(player.UserId);
			print("Player removed");
		});
	}
}
