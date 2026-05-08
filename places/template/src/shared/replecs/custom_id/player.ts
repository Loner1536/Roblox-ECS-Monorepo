// Packages
import { create_custom_id } from "@rbxts/replecs";

// Shared
import Core from "@shared/core";

const { W, C } = Core;

const PlayerCustomId = create_custom_id("player_custom_id");

PlayerCustomId.handle((ctx) => {
	if (!ctx.has(C.Tags.Player)) return W.entity();

	const server_userId = ctx.component(C.Player.UserId);
	if (!server_userId) return W.entity();

	for (const [entity, client_userId] of W.query(C.Player.UserId).with(C.Tags.Player)) {
		if (client_userId === server_userId) return entity;
	}

	return W.entity();
});

export default PlayerCustomId;
