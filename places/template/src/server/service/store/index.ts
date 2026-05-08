// Packages
import { MockDataStoreService, MockMemoryStoreService, createPlayerStore } from "@rbxts/lyra";
import { Service, OnInit, Flamework } from "@flamework/core";
import { RunService } from "@rbxts/services";

// Shared
import API from "@shared/api";

@Service({ loadOrder: 1 })
export default class StoreService implements OnInit {
	public store = createPlayerStore<Type.Player.Data.Raw>({
		name: "PlayerData",
		template: API.Player.Schema,
		schema: Flamework.createGuard<Type.Player.Data.Raw>(),
		dataStoreService: new MockDataStoreService(),
		memoryStoreService: new MockMemoryStoreService(),
		changedCallbacks: [
			(userId, newData, _oldData) => {
				const mockedPlayer = {
					Name: "Lyra(Changed Callback)" + userId,
					UserId: tonumber(userId),
				} as Partial<Player> as Player;

				API.State.Player.update(mockedPlayer, (data) => ({
					...data,
					...newData,
				}));
			},
		],
		logCallback: this.createLogger(),

		// Add migration steps if needed
		/**
		 * Example of how to add Lyra migrations when needed:
		 *
		 * migrationSteps: [
		 *     Lyra.MigrationStep.addFields("addGems", { gems: 0 }),
		 *     Lyra.MigrationStep.transform("renameInventory", (data) => {
		 *         data.items = data.inventory;
		 *         data.inventory = undefined;
		 *         return data;
		 *     }),
		 * ],
		 *
		 * importLegacyData: (key: string) => {
		 *     // Import data from old DataStore if needed
		 *     return undefined; // or legacy data
		 * },
		 */

		// Legacy data import if needed
		// importLegacyData: (key: string) => { /* ... */ },
	});

	onInit(): void {
		game.BindToClose(() => {
			this.store.closeAsync();
		});
	}

	private createLogger() {
		if (RunService.IsStudio() === true) {
			return (message: { level: string; message: string; context?: unknown }) => {
				print(`[Lyra][${message.level}] ${message.message}`);
				if (message.context !== undefined) {
					print("Context:", message.context);
				}
			};
		} else {
			return (message: { level: string; message: string; context?: unknown }) => {
				if (message.level === "error" || message.level === "fatal") {
					warn(`[Lyra] ${message.message}`);
				}
			};
		}
	}
}
