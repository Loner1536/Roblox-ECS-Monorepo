// Packages
import { Service, OnInit } from "@flamework/core";
import * as Conch from "@rbxts/conch";

// Shared
import safePlayerAdded from "@global/shared/util/safe.player.added";

@Service()
export default class CMDService implements OnInit {
	private permissions = {
		admin: [2828974715],
	};

	onInit() {
		safePlayerAdded((player) => {
			if (this.permissions.admin.includes(player.UserId)) {
				const user = Conch.get_user(player);
				Conch.give_roles(user, "admin");
			}
		});

		Conch.initiate_default_lifecycle();
		this.setupAdminCommands();
	}

	private setupAdminCommands() {
		Conch.set_role_permissions("admin", "kick", "load-stage");

		Conch.register("kick", {
			description: "Kicks a player from the server.",
			permissions: ["admin"],
			arguments: () =>
				$tuple(
					Conch.args.player("Player", "The player to kick."),
					Conch.args.string("Reason", "The reason for kicking the player."),
				),
			callback: (player, reason) => {
				if (!player) return;
				player.Kick("You have been kicked from the server.");
				print(`Kicked player ${player.Name} for reason: ${reason}`);
			},
		});
	}
}
