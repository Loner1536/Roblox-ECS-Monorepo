// Packages
import { initiate_default_lifecycle } from "@rbxts/conch";
import { Controller, OnStart } from "@flamework/core";
import { bind_to } from "@rbxts/conch-ui";

@Controller()
export default class Index implements OnStart {
	onStart() {
		initiate_default_lifecycle();
		bind_to(Enum.KeyCode.F4);
	}
}
