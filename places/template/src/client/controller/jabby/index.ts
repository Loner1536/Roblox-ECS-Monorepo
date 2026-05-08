// Packages
import { ContextActionService } from "@rbxts/services";
import { Controller, OnInit } from "@flamework/core";
import jabby from "@rbxts/jabby";

@Controller()
export default class Logic implements OnInit {
	onInit() {
		const client = jabby.obtain_client();

		function createWidget(_: string, state: Enum.UserInputState) {
			if (state !== Enum.UserInputState.Begin) return;
			client.spawn_app(client.apps.home);
		}
		ContextActionService.BindAction("Open Jabby Home", createWidget, false, Enum.KeyCode.F3);
	}
}
