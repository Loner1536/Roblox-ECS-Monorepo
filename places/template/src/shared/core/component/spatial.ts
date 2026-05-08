// Packages
import { u16, Vector } from "@rbxts/serio";

// Shared
import Base from "./base";

export default class Spatial extends Base {
	Grid = this.SerdesComponent<{ x: u16; z: u16 }>("Grid");

	WorldPosition = this.SerdesComponent<Vector>("WorldPosition");
	WorldSize = this.SerdesComponent<Vector>("WorldSize");

	Instance = this.SerdesComponent<Instance>("Instance");
}
