// Types
import type { u32 } from "@rbxts/serio";

// Shared
import Base from "./base";

export default class Player extends Base {
	UserId = this.SerdesComponent<u32>("UserId"); // Update this to f64 if needed!
}
