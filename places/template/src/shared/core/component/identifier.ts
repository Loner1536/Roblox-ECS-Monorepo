// Packages
import { u8, u16 } from "@rbxts/serio";

// Shared
import Base from "./base";

export default class Identifier extends Base {
	DisplayName = this.SerdesComponent<string>("DisplayName");
	Index = this.SerdesComponent<u8>("Index");
	Hash = this.SerdesComponent<u16>("Hash");
}
