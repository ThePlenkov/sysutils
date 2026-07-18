# @sysutils/ps-dotnet-nodeapi

In-process .NET backend for `@sysutils/ps`, loaded via
[`node-api-dotnet`](https://www.npmjs.com/package/node-api-dotnet).

This package builds a small managed .NET assembly that exposes a
`PsModule.ListProcesses(fields)` method. The assembly is loaded in-process by
Node.js through the `node-api-dotnet` npm package, avoiding the spawn overhead of
the CLI backend while reusing the same platform readers as `@sysutils/ps-dotnet`.

## Building locally

```bash
cd packages/ps-dotnet-nodeapi
npm run build
```

`dotnet publish -c Release -r <RID>` is run by the `scripts/build.js` helper,
which detects the current platform/architecture. Use `npm run build:all` to
publish every supported RID from the command line.

Supported RIDs:

- `win-x64`
- `win-arm64`
- `linux-x64`
- `linux-arm64`
- `osx-x64`
- `osx-arm64`

## Binary layout

Published assemblies live in `bin/<RID>/ps-nodeapi.dll` alongside their runtime
dependencies (`Microsoft.JavaScript.NodeApi.dll`, `ps-nodeapi.deps.json`).
`binaries.json` maps `process.platform-process.arch` to the correct DLL path.

## Runtime dependency

The published assembly is loaded by `node-api-dotnet`, which must be installed
alongside this package. The parent `@sysutils/ps` package declares it as an
optional dependency; direct consumers should install it too.

## API

This package is not usually consumed directly. Use `@sysutils/ps` instead:

```ts
import { listProcesses } from "@sysutils/ps";

const procs = await listProcesses();
```

## See also

- `@sysutils/ps` — Node.js streaming wrapper.
- `@sysutils/ps-dotnet` — standalone AOT CLI backend.
