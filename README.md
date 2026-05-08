# template-game

A production-grade Roblox TypeScript game template built on a fully custom ECS architecture. Batteries included: replication, state sync, persistent data, reactive UI, admin commands, and a profiler — all wired together and ready to extend.

---

## Stack

| Layer | Library | Purpose |
|---|---|---|
| Language | [roblox-ts](https://roblox-ts.com/) | TypeScript → Luau compiler |
| IoC / DI | [Flamework](https://flamework.fireboltofdeath.dev/) | Services, Controllers, dependency injection |
| ECS | [@rbxts/jecs](https://github.com/Ukendio/jecs) | Entity Component System world |
| Scheduling | [@rbxts/planck](https://github.com/yetanotherclown/planck) | ECS system scheduler with phases |
| Replication | [@rbxts/replecs](https://github.com/PepeElToro41/replecs) | Server → client ECS state replication |
| State | [@rbxts/charm](https://github.com/littensy/charm) | Atom-based reactive state |
| State sync | [@rbxts/charm-sync](https://github.com/littensy/charm/tree/main/packages/charm-sync) | Server → client atom hydration |
| Networking | [@rbxts/lync](https://github.com/Axp3cter/Lync) | Typed packet + query networking layer |
| Serialization | [@rbxts/serio](https://github.com/R-unic/serio) | Binary serialization for ECS components |
| Data | [@rbxts/lyra](https://github.com/6ixfalls/rbxts-lyra) | Player DataStore with sessions + migrations |
| UI | [@rbxts/vide](https://github.com/littensy/vide) | Reactive UI (Solid.js-style) |
| UI framework | [@rbxts/forge](https://github.com/Loner1536/forge) | App/Args component model over Vide |
| Assets | [Asphalt](https://github.com/jackTabsCode/asphalt) | Type-safe asset ID references |
| Commands | [@rbxts/conch](https://github.com/alicesaidhi/conch) | Admin command system |
| Profiler | [@rbxts/jabby](https://github.com/alicesaidhi/jabby) | In-game ECS profiler and world inspector |

---

## Project Structure

```
places/
├── shared/                     # Code shared across all places
│   └── src/
│       ├── global.d.ts         # Global type declarations (Game, Type namespaces)
│       └── shared/util/
│           └── safe.player.added.ts
│
└── template/                   # Main game place
    └── src/
        ├── client/
        │   ├── index.client.ts         # Client boot entrypoint
        │   ├── class/player/           # Client PlayerClass (ECS entity per player)
        │   ├── controller/
        │   │   ├── app/                # Mounts the Vide UI tree (Forge)
        │   │   ├── cmd/                # Binds Conch command UI (F4)
        │   │   ├── jabby/              # Opens Jabby profiler UI (F3)
        │   │   └── player/             # Spawns client PlayerClass on join
        │   ├── interface/app/
        │   │   └── template/           # Example Forge App component
        │   └── system/
        │       └── replecs.ts          # Client-side ECS replication system
        │
        ├── server/
        │   ├── index.server.ts         # Server boot entrypoint
        │   ├── class/player/           # Server PlayerClass (ECS entity + Lyra store)
        │   ├── service/
        │   │   ├── store/              # Lyra PlayerStore (loadOrder: 1)
        │   │   ├── player/             # Player lifecycle — creates/destroys PlayerClass
        │   │   └── cmd/                # Conch admin commands (kick, etc.)
        │   └── system/
        │       └── replecs.ts          # Server-side ECS replication + update loop
        │
        └── shared/                     # Shared between client and server
            ├── api/
            │   ├── index.ts            # Main API export surface
            │   ├── hash.ts             # FNV-1a hashing + branded hash types
            │   ├── definition/         # Flat + categorized game definition registries
            │   ├── palette/            # Color palette (extend as needed)
            │   ├── player/
            │   │   └── schema.ts       # Default player data shape (Lyra template)
            │   ├── state/
            │   │   ├── index.ts        # State aggregator — Sourced(), Atoms
            │   │   └── player.ts       # Player data atom (Charm)
            │   └── world/              # World-level state (extend as needed)
            ├── asset/
            │   └── index.ts            # Asphalt asset re-export
            ├── core/
            │   ├── index.ts            # Core singleton: W, C, Replicator, Scheduler
            │   ├── profiler.ts         # Jabby profiler wrapper
            │   └── component/          # All ECS component definitions
            │       ├── base.ts         # LocalComponent, SerdesComponent, SharedTag helpers
            │       ├── identifier.ts   # DisplayName, Index, Hash components
            │       ├── lifecycle.ts    # Connection, Connections components
            │       ├── player.ts       # UserId component
            │       ├── spatial.ts      # Grid, WorldPosition, WorldSize, Instance
            │       └── tags.ts         # Player tag
            ├── decorator/
            │   └── system.ts           # @System decorator + bootSystems()
            ├── network/
            │   ├── index.ts            # Network export (Replecs + Charm packets)
            │   ├── replecs.ts          # Lync packets for Replecs replication
            │   ├── charm.ts            # Charm-sync server/client setup
            │   └── codec/              # Lync codecs (primitives, player data)
            └── replecs/
                └── custom_id/
                    └── player.ts       # Custom replication ID — maps server entity → client entity by UserId
```

---

## Core Concepts

### The `Core` Singleton

Everything ECS-related flows through a single `Core` object (`shared/core/index.ts`):

```ts
import Core from "@shared/core";

const { W, C, Replicator, Scheduler, JabbyProfiler } = Core;
```

| Property | Type | Description |
|---|---|---|
| `W` | `World` | The jecs ECS world |
| `C` | `Components` | All component definitions (Identifier, Spatial, Player, Tags, etc.) |
| `Replicator` | `Replecs` | Server/client replication handle |
| `Scheduler` | `Scheduler` | Planck scheduler for ECS systems |
| `JabbyProfiler` | `Profiler` | Jabby integration for the in-game profiler |

### ECS Components

Components are defined as classes extending `Base` (`shared/core/component/base.ts`). Three helper methods are available:

```ts
// Local only — not replicated
this.LocalComponent<T>(name)
this.LocalTag(name)

// Replicated — registers Replecs.Shared
this.SharedTag(name)

// Replicated with binary serialization via Serio
this.SerdesComponent<T>(name)
```

> **Important:** Always use Serio's primitive types (`u8`, `u16`, `u32`, `i8`, `i16`, `i32`, `f32`, `f64`, `Vector`, etc.) for `SerdesComponent` type parameters rather than plain TypeScript primitives like `number`. The `SerdesComponent` method uses a Flamework macro to generate the serializer at compile time — the macro reads the type to determine the correct binary layout, so `SerdesComponent<u32>` and `SerdesComponent<number>` produce different (and for the latter, broken) output.

Add new component groups by creating a class in `shared/core/component/` and registering it in `component/index.ts`.

### The `@System` Decorator

Systems run outside of Flamework's DI cycle and are registered via the `@System` decorator. Choose a base class depending on where the system lives:

#### `Server` — server only

```ts
import System, { Server } from "@shared/decorator/system";

@System("MyCategory", "MySystem")
export default class MySystem extends Server {
    onStartup() { ... }         // runs once on server boot
    onUpdate(dt: number) { ... } // runs every Heartbeat on server
}
```

#### `Client` — client only

```ts
import System, { Client } from "@shared/decorator/system";

@System("MyCategory", "MySystem")
export default class MySystem extends Client {
    onStartup() { ... }         // runs once on client boot
    onUpdate(dt: number) { ... } // runs every Heartbeat on client
}
```

#### `Shared` — runs on both, with split hooks per runtime

`Shared` is the most expressive base. It provides separate startup and update hooks for server and client so one system class can handle both runtimes with different logic:

```ts
import System, { Shared } from "@shared/decorator/system";

@System("MyCategory", "MySystem")
export default class MySystem extends Shared {
    onStartup() { ... }              // runs on both server and client

    onServerStartup() { ... }        // server only
    onClientStartup() { ... }        // client only

    onUpdate(dt: number) { ... }     // runs on both every Heartbeat

    onServerUpdate(dt: number) { ... } // server only, every Heartbeat
    onClientUpdate(dt: number) { ... } // client only, every Heartbeat
}
```

All three base classes automatically receive `W`, `C`, `Replicator`, `Scheduler`, and `JabbyProfiler` via `Object.assign` in the constructor — no imports needed inside the system body.

#### Rate-limited methods (`intervals`)

Any base class can declare an `intervals` map. The key must match a method name on the class, and the value is the target call rate in calls/second:

```ts
@System("Replication", "Replecs")
export default class Replecs extends Server {
    intervals = {
        Update: 20, // calls this.Update() 20x/sec
    };

    Update() {
        // collect and send ECS diffs to clients
    }
}
```

Interval methods are profiled through Jabby automatically alongside `onUpdate`.

Systems are booted by calling `bootSystems()` in the entrypoints, after `Flamework.ignite()`.

### Player Data Flow

1. `StoreService` creates a Lyra `PlayerStore` with the schema from `API.Player.Schema`.
2. `PlayerService` calls `safePlayerAdded` and constructs a `PlayerClass` for each joining player.
3. `PlayerClass.getFromStore()` loads data from Lyra and writes it into the Charm atom via `API.State.Player.set(player, data)`.
4. `charmSync()` (charm-sync) automatically patches all connected clients with their filtered atom slice on every state change.
5. On the client, Vide components subscribe to the atom via `API.State.Sourced({ player })` which returns reactive Vide sources.

### ECS Replication (Replecs)

Server entities marked with `Replicator.server.set_networked(entity, player)` are replicated to the corresponding client. Component data is serialized using `SerdesComponent` + Serio.

The `Player` custom ID (`shared/replecs/custom_id/player.ts`) ensures the server-side player entity maps to the correct client-side entity by matching `UserId`.

Replication runs at 20 Hz via the `intervals` map on the server Replecs system.

### Game Definitions & Hashing

Game content (units, items, categories) is registered using FNV-1a hashing into typed registries:

```ts
// Flat registry (single level)
const Template = createFlatRegistry("TemplateHash", { Test });

// Category registry (two levels: "Cat.Key")
const Template_Category = createCategoryRegistry("Template_CategoryHash", { Category });
```

Hashes are branded types (`Hash<"TemplateHash">`) so lookups are type-safe. Collisions throw at startup.

---

## Boot Sequence

Both entrypoints (`index.server.ts` / `index.client.ts`) follow the same pattern:

```ts
Lync.configure({ stats: true });
Lync.start();          // Register all Lync packets

Flamework.ignite();    // Boot all @Service / @Controller
bootSystems();         // Boot all @System-decorated ECS systems
charmSync();           // Start Charm server↔client atom sync
```

---

## Path Aliases

Configured in `tsconfig.json`:

| Alias | Resolves to |
|---|---|
| `@global/*` | `places/shared/src/*` |
| `@shared/*` | `places/template/src/shared/*` |
| `@client/*` | `places/template/src/client/*` |
| `@server/*` | `places/template/src/server/*` |

---

## Dev Commands

Scripts are defined in `places/template/package.json`. The recommended way to run them is from `code.workspace` (the monorepo root), but you can also `cd places/template` and run them directly — both work.

```bash
# Watch-compile TypeScript + serve via Rojo (use this during active development)
bun run dev

# Compile TypeScript only (no Rojo serve)
bun run compile

# Build a .rbxlx release file
bun run build

# Link node_modules from the monorepo root into places/template
# Run this once after cloning or after adding new packages
bun run link

# Upload new/changed assets to Roblox and regenerate assets.d.ts
bun run sync

# Sync assets locally into Studio (no upload — good for testing before going live)
# Note: does not work inside a Dev Container
bun run sync:studio
```

> `sync` requires the `ASPHALT_API_KEY` environment variable to be set. See [Assets (Asphalt)](#assets-asphalt) below.

---

## Assets (Asphalt)

Assets are managed by [Asphalt](https://github.com/jackTabsCode/asphalt). It uploads files to Roblox, writes a lockfile (`asphalt.lock.toml`) with the resulting asset IDs, and regenerates `src/shared/asset/assets.d.ts` so every asset path is type-safe in TypeScript.

### Setup checklist

**1. Install tools via Rokit**

Asphalt (and Rojo) are managed by [Rokit](https://github.com/rojo-rbx/rokit) and defined in `rokit.toml`. If you haven't already:

```bash
rokit install
```

This installs the pinned versions of all tools including `asphalt@2.0.0` — no manual `cargo install` needed.

**2. Verify `asphalt.toml` at the project root**

The generated `assets.d.ts` lives at `places/shared/src/shared/`, so your config should look like this:

```toml
[creator]
type = "user" | "group"
id = USER_ID | GROUP_ID

[codegen]
output_name = "Asphalt"
strip_extensions = true
typescript = true

[inputs.assets]
path = "assets/asphalt/**"
output_path = "places/shared/src/shared/asset"
```

**3. Set your API key**

Get a key from the [Creator Dashboard](https://create.roblox.com/dashboard/credentials) and set it as an environment variable:

```bash
# .env or shell profile
ASPHALT_API_KEY=your_key_here
```

### Sync targets

| Command | What it does |
|---|---|
| `bun run sync` | Uploads changed assets to Roblox, updates `asphalt.lock.toml`, regenerates `assets.d.ts` |
| `bun run sync:studio` | Syncs assets locally into Studio — no upload, no lockfile change. **Does not work in a Dev Container.** |

Commit `asphalt.lock.toml` to source control. It maps every asset path to its Roblox ID and prevents redundant re-uploads.

### Adding a new asset

1. Drop the file into your `assets/` directory.
2. Run `bun run sync` to upload it and regenerate `assets.d.ts`.
3. Reference it via `API.Assets["your/asset/path"]` — fully typed.

> If `assets.d.ts` is stale or missing, run `bun run sync` (or `sync:studio` for a local-only pass). Make sure `asphalt.toml` exists at the project root and `ASPHALT_API_KEY` is set before syncing to cloud.

---

## Extending the Template

### Adding a new ECS component

1. Create or edit a file in `shared/core/component/`.
2. Add it to the class extending `Base`, using `LocalComponent`, `SerdesComponent`, or `SharedTag`.
3. Register it in `shared/core/component/index.ts` inside the `Components` constructor.

### Adding a new system

1. Create a file in `server/system/`, `client/system/`, or `shared/system/`.
2. Decorate it with `@System("Category", "Name")` and extend `Server`, `Client`, or `Shared`.
3. Flamework's `addPaths` call in the entrypoint already covers those directories — no further registration needed.

### Adding player data fields

1. Add the field to `Type.Player.Data.Raw` in `shared/src/global.d.ts`.
2. Add a default value to `shared/api/player/schema.ts`.
3. Add a codec entry in `shared/network/codec/player.ts` for Charm-sync serialization.
4. Add a reactive source in `shared/api/state/player.ts` inside `getSourced`.

### Adding a new game definition

1. Create a definition object in `shared/api/definition/`.
2. Register it with `createFlatRegistry` or `createCategoryRegistry` and add it to `shared/api/definition/index.ts`.
3. Access it anywhere via `API.Definitions.YourDefinition`.

### Adding a new UI screen

1. Create a `.tsx` file in `client/interface/app/your-screen/`.
2. Decorate the class with `@App({ group: "YourGroup", name: "YourScreen" })` and extend `Args`.
3. Implement `render()` returning Vide JSX.
4. Forge's `AppController` automatically mounts all apps under `src/client/interface/app/`.

---

## Type Namespaces

Declared in `places/shared/src/global.d.ts`:

```ts
// Game-specific enums / constants
namespace Game {
    // Add game-wide enums here
}

// All data shapes
namespace Type {
    namespace Player {
        namespace Data {
            type Raw     // Plain data stored in Lyra
            type Sourced // Vide.Source<T> versions for reactive UI
            type Teleport
        }
    }
    namespace Test {
        type Raw
        type Player  // { hash: number; level: number }
    }
}
```

Extend these namespaces to add new data types without touching import trees.