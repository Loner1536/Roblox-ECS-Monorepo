// Packages
import { Flamework } from "@flamework/core";
import Lync from "@rbxts/lync";

// Shared
import { bootSystems } from "@shared/decorator/system";
import { charmSync } from "@shared/network/charm";
import "@shared/network";
import "@shared/api";

// Game
Flamework.addPaths("src/client/interface/app");
Flamework.addPaths("src/client/controller");
Flamework.addPaths("src/client/system");
Flamework.addPaths("src/shared/system");

Lync.configure({ stats: true });
Lync.start();

Flamework.ignite();
bootSystems();
charmSync();
