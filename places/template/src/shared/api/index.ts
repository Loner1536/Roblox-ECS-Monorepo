// Internals
import hash, { reserveHashes, toHash } from "./hash";
import Definitions from "./definition";
import Palette from "./palette";
import Player from "./player";
import Assets from "../asset";
import World from "./world";
import State from "./state";

const API = {
	hash: { compute: hash, to: toHash, reserve: reserveHashes },

	Definitions,
	Palette,
	Player,
	Assets,
	World,
	State,
} as const;

export default API;
