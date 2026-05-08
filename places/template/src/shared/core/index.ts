// Packages
import { Plugin } from "@rbxts/planck-runservice";
import { Scheduler } from "@rbxts/planck";
import { create } from "@rbxts/replecs";
import { world } from "@rbxts/jecs";

// Shared
import Components from "./component";
import Profiler from "./profiler";

class Singleton {
	public W = world();
	public C = new Components(this.W);

	public JabbyProfiler = new Profiler();
	public Scheduler: Scheduler<[this]>;
	public Replicator = create(this.W);

	constructor() {
		this.Scheduler = new Scheduler(this);
		this.Scheduler.addPlugin(new Plugin());

		this.JabbyProfiler.Init("Gameplay");
		this.JabbyProfiler.RegisterWorld(this.W);
	}
}

const Core = new Singleton();
export default Core;
