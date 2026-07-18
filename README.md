# @sysutils

Cross-platform, stream-first system utilities for Node.js.

`@sysutils` is a monorepo of small, focused packages that expose OS-level
information (processes, network, disks, etc.) through Node.js streams. Each
utility ships its own native backend(s) and exposes a single async, streaming
JavaScript API.

## Packages

| package                                                       | description                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`@sysutils/ps`](./packages/ps)                               | Cross-platform process listing as a Node.js `Readable` stream.    |
| [`@sysutils/ps-dotnet`](./packages/ps-dotnet)                 | Native .NET AOT CLI backend for `@sysutils/ps`.                   |
| [`@sysutils/ps-dotnet-nodeapi`](./packages/ps-dotnet-nodeapi) | In-process .NET backend for `@sysutils/ps` via `node-api-dotnet`. |

## Layout

```
packages/
  ps/                   # Node.js entrypoint (@sysutils/ps)
  ps-dotnet/            # .NET AOT CLI binary package
  ps-dotnet-nodeapi/    # .NET assembly loaded by node-api-dotnet
.github/
  workflows/            # CI builds for native binaries
.agents/               # Agent rules and skills
docs/adr/              # Architecture decision records
```

## Tooling

- Node.js `>=24` with `npm` workspaces.
- .NET 8 SDK (for `ps-dotnet` and `ps-dotnet-nodeapi`).

## Read-first

1. `AGENTS.md` — the agent contract.
2. `.agents/RULES.md` — rule index for tracked `.md` files.
3. Package `README.md` for the component you are touching.
