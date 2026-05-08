// Packages
import { Flamework } from "@flamework/core";
import Lync from "@rbxts/lync";

// Shared
import { bootSystems } from "@shared/decorator/system";
import { charmSync } from "@shared/network/charm";
import "@shared/network";
import "@shared/api";

// Game
Flamework.addPaths("src/server/service");
Flamework.addPaths("src/server/system");
Flamework.addPaths("src/shared/system");

Lync.configure({ stats: true });
Lync.start();

Flamework.ignite();
bootSystems();
charmSync();
