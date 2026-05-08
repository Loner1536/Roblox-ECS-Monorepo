// Packages
import { type World } from "@rbxts/jecs";

// Components
import Identifier from "./identifier";
import Lifecycle from "./lifecycle";
import Spatial from "./spatial";
import Player from "./player";
import Tags from "./tags";

export default class Components {
	readonly Identifier: Identifier;
	readonly Lifecycle: Lifecycle;
	readonly Spatial: Spatial;
	readonly Player: Player;
	readonly Tags: Tags;

	constructor(world: World) {
		this.Identifier = new Identifier(world);
		this.Lifecycle = new Lifecycle(world);
		this.Spatial = new Spatial(world);
		this.Player = new Player(world);
		this.Tags = new Tags(world);
	}
}
