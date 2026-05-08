// Packages
import CharmSync, { server, client } from "@rbxts/charm-sync";
import { RunService } from "@rbxts/services";
import Lync from "@rbxts/lync";

// Shared
import API from "@shared/api";
import Codec from "./codec";

const filter: Array<number> = [];

const NONE_SENTINEL = { __none: "__none" } as const;

const InitCodec = Lync.struct({
	player: Lync.optional(Lync.map(Codec.Primitives.u32, Codec.Player.Data)),
});

const PatchCodec = Lync.struct({
	player: Lync.optional(
		Lync.map(Codec.Primitives.u32, Lync.nullable(Codec.Player.Data, NONE_SENTINEL)),
	),
});

const CharmNetwork = {
	Packet: {
		InitState: Lync.packet("CharmInitState", Lync.nothing),
		SyncPatch: Lync.packet("CharmSyncPatch", PatchCodec),
		SyncInit: Lync.packet("CharmSyncInit", InitCodec),
	},
	Querie: {},
};

export function charmSync() {
	if (RunService.IsServer()) {
		const syncer = server({ atoms: API.State.Atoms, autoSerialize: false });

		syncer.connect((player, payload) => {
			if (CharmSync.isNone(payload)) return;

			const src = payload.data.player as Map<number, never> | undefined;
			const filtered = new Map<number, never>();
			if (src) {
				const addEntry = (id: number) => {
					const value = src.get(id);
					if (value !== undefined) filtered.set(id, value);
				};

				addEntry(player.UserId);
				filter.forEach(addEntry);
			}

			if (payload.type === "init") CharmNetwork.Packet.SyncInit.send(payload.data as never, player);
			else CharmNetwork.Packet.SyncPatch.send(payload.data as never, player);
		});

		CharmNetwork.Packet.InitState.on((_, player) => {
			syncer.hydrate(player!);
		});
	} else {
		const syncer = client({ atoms: API.State.Atoms });

		CharmNetwork.Packet.SyncInit.on((data) => syncer.sync({ type: "init", data } as never));
		CharmNetwork.Packet.SyncPatch.on((data) => syncer.sync({ type: "patch", data } as never));
		CharmNetwork.Packet.InitState.send(undefined);
	}
}

export default CharmNetwork;
