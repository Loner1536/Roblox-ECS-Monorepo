// Packages
import Lync from "@rbxts/lync";

const replecsValidate = (_data: unknown) => $tuple(true, undefined as never);

const ReplecsNetwork = {
	Packet: {
		update: Lync.packet(
			"ReplecsUpdate",
			Lync.struct({
				buf: Lync.buff,
				variants: Lync.optional(Lync.array(Lync.array(Lync.unknown))),
			}),
			{ validate: replecsValidate },
		),
		unreliable: Lync.packet(
			"ReplecsUnreliable",
			Lync.struct({
				buf: Lync.buff,
				variants: Lync.optional(Lync.array(Lync.array(Lync.unknown))),
			}),
			{ validate: replecsValidate },
		),
	},
	Querie: {
		getFullState: Lync.query(
			"ReplecsGetFullState",
			Lync.nothing,
			Lync.struct({
				buf: Lync.buff,
				variants: Lync.optional(Lync.array(Lync.array(Lync.unknown))),
			}),
		),
	},
};

export default ReplecsNetwork;
