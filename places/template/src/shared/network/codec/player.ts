// Packages
import Lync from "@rbxts/lync";

// Shared
import Primitives from "./primitive";

const Player = {
	Data: Lync.struct({
		test: Lync.array(Lync.struct({ hash: Primitives.u16, level: Lync.int(1, 100) })),
	}),
} as const;

export default Player;
