// Packages
import { useAtom } from "@rbxts/vide-charm";
import Object from "@rbxts/object-utils";
import { atom } from "@rbxts/charm";

const Atom = atom<Map<number, Type.Player.Data.Raw>>(new Map());

function getSourced(ctx: { player: Player }) {
	const data = Atom().get(ctx.player.UserId);

	return {
		test: useAtom(() => data?.test ?? []),
	} as const satisfies Type.Player.Data.Sourced;
}

function getRaw(player: Player): Type.Player.Data.Raw | undefined {
	return Atom().get(player.UserId);
}

function set(player: Player, newData: Type.Player.Data.Raw) {
	Atom((current) => {
		const n = Object.deepCopy(current);
		n.set(player.UserId, newData);
		return n;
	});
}

function update(player: Player, updater: (data: Type.Player.Data.Raw) => Type.Player.Data.Raw) {
	Atom((current) => {
		const n = Object.deepCopy(current);
		const data = n.get(player.UserId);
		if (!data) return current;
		n.set(player.UserId, updater(data));
		return n;
	});
}

function remove(player: Player) {
	Atom((current) => {
		const n = Object.deepCopy(current);
		n.delete(player.UserId);
		return n;
	});
}

const PlayerState = {
	Atom,

	getRaw,
	getSourced,

	set,
	update,
	remove,
};

export default PlayerState;
