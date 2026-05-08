// Packages
import Lync from "@rbxts/lync";

// Categories
import Primitives from "./primitive";
import Player from "./player";

function brand<T extends Hashes>(codec: Lync.Codec<number>): Lync.Codec<Hash<T>> {
	return codec as unknown as Lync.Codec<Hash<T>>;
}

const Codec = {
	Primitives,
	Player,
	brand,
} as const;

export default Codec;
