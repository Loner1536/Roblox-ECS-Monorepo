// Packages
import { Controller, OnInit } from "@flamework/core";
import Vide, { mount } from "@rbxts/vide";
import { Players } from "@rbxts/services";
import CreateForge from "@rbxts/forge";

// Shared
import API from "@shared/api";

@Controller({ loadOrder: 2 })
export default class AppController implements OnInit {
	onInit() {
		mount(() => {
			const props = this.createProps(Players.LocalPlayer!);
			const forge = new CreateForge();

			return (
				<screengui Name={"App Tree"} ResetOnSpawn={false} IgnoreGuiInset>
					<forge.render props={{ props }} />
				</screengui>
			);
		}, Players.LocalPlayer.WaitForChild("PlayerGui"));
	}

	public createProps(player: Player) {
		const local_player = Players.LocalPlayer ?? player;

		if (!player) error("No LocalPlayer nor MockedPlayer found for AppController props");

		return {
			Player: local_player,

			State: API.State.Sourced({ player: local_player }),
		};
	}
}
