// Shared
import System, { Server } from "@shared/decorator/system";
import Network from "@shared/network";

@System("Replecs", "Replication")
export default class Replecs extends Server {
	intervals = {
		Update: 20,
	};

	onStartup() {
		this.Replicator.server.init();

		Network.Replecs.Querie.getFullState.handle((_, player) => {
			if (!this.Replicator.server) error("Replecs Server not initialized");

			this.Replicator.server.mark_player_ready(player!);

			const [buf, variants] = this.Replicator.server.get_full(player!);

			return { buf, variants };
		});
	}

	Update() {
		for (const [player, buf, variants] of this.Replicator.server.collect_updates()) {
			Network.Replecs.Packet.update.send({ buf, variants }, player);
		}

		for (const [player, buf, variants] of this.Replicator.server.collect_unreliable()) {
			Network.Replecs.Packet.unreliable.send({ buf, variants }, player);
		}
	}
}
