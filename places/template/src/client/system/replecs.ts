// Shared
import System, { Server } from "@shared/decorator/system";
import Network from "@shared/network";

@System("Replecs", "Replication")
export default class Replecs extends Server {
	async onStartup() {
		this.Replicator.client.init();

		Network.Replecs.Packet.update.on((data) => {
			this.Replicator.client!.apply_updates(data.buf, data.variants as defined[][] | undefined);
		});

		Network.Replecs.Packet.unreliable.on((data) => {
			this.Replicator.client!.apply_unreliable(data.buf, data.variants as defined[][] | undefined);
		});

		const result = await Network.Replecs.Querie.getFullState.request(undefined);
		if (!result) return error("Failed to get full state from server");
		this.Replicator.client!.apply_full(result.buf, result.variants as defined[][] | undefined);
	}
}
