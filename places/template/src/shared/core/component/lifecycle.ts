// Shared
import Base from "./base";

export default class Lifecycle extends Base {
	Connection = this.LocalComponent<RBXScriptConnection>("Connection");
	Connections = this.LocalComponent<RBXScriptConnection[]>("Connections");
}
