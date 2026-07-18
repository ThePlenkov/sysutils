# ADR 0001: Native backend for `@sysutils/ps`

## Status

Accepted — Rust backend removed; .NET is the single maintained native stack.

## Context

`@sysutils/ps` needs a small, fast, cross-platform native component that
enumerates processes and prints one JSON object per line. Node.js consumes that
output either by spawning a CLI or by loading a .NET assembly in-process.

We evaluated Rust (`sysinfo` crate) and .NET 8 (P/Invoke + Native AOT / single
file). The Rust implementation was a useful spike, but maintaining two separate
platform readers duplicated effort with the .NET Node-API in-process backend.

## Decision

Use **.NET** as the only maintained native stack for `@sysutils/ps`:

- `@sysutils/ps-dotnet` — standalone Native AOT / single-file CLI binary.
- `@sysutils/ps-dotnet-nodeapi` — managed assembly loaded by `node-api-dotnet`
  for in-process calls from Node.js.

Both packages share `packages/ps-dotnet/Program.cs`, which implements
`WindowsReader`, `LinuxReader`, and `MacReader` using raw OS APIs.

## Comparison

| Dimension             | .NET CLI (`@sysutils/ps-dotnet`)                       | .NET in-process (`@sysutils/ps-dotnet-nodeapi`)         |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Language / runtime    | Native AOT or single-file self-contained               | Managed DLL loaded by `node-api-dotnet`                 |
| Binary size           | ~822 KB–1.3 MB (AOT)                                   | ~500 KB (assembly + `Microsoft.JavaScript.NodeApi.dll`) |
| Startup latency       | ~28 ms (win-arm64 AOT)                                 | ~6 ms (Windows), ~0.8 ms (Linux)                        |
| .NET runtime required | No (AOT / self-contained)                              | Yes                                                     |
| Cross-compilation     | `dotnet publish -r <RID>`; Windows AOT needs MSVC host | `dotnet publish -r <RID>` from any .NET SDK host        |
| Node interop          | `child_process.spawn` of CLI                           | `node-api-dotnet` in-process call                       |
| Testing               | `dotnet test` + `node --test`                          | `dotnet test` + `node --test`                           |

## Measured results

Measured on a Surface Pro X (Windows 11 ARM64 + WSL2 Ubuntu ARM64):

| Command                                     | WSL/Linux | Windows                      |
| ------------------------------------------- | --------- | ---------------------------- |
| native `ps -e -o pid,ppid,comm`             | ~3.6 ms   | n/a                          |
| `fastlist` (pid, ppid, name)                | n/a       | ~37 ms (x64 emulation)       |
| `@sysutils/ps-dotnet` AOT (pid, ppid, name) | ~20 ms    | ~28 ms (arm64)               |
| `node-api-dotnet` in-proc (pid, ppid, name) | ~0.8 ms   | ~6 ms                        |
| `ps-list`                                   | ~7.8 ms   | unsupported on Windows ARM64 |
| `tasklist`                                  | n/a       | ~360 ms                      |

The in-process `node-api-dotnet` backend is the fastest option and supports
Windows ARM64, which `ps-list`/`fastlist` do not.

## ProcessInfo fields

Both .NET backends emit the same JSON-lines contract, aligned with
[`ps-list`](https://www.npmjs.com/package/ps-list):

```ts
interface ProcessInfo {
  pid: number;
  ppid: number;
  uid?: number;
  name: string;
  cmd?: string;
  path?: string;
  startTime?: Date;
  cpu?: number; // percent of one CPU
  memory?: number; // percent of total physical memory
}
```

Linux populates all fields from `/proc`. Windows and macOS currently emit
`pid`, `ppid`, and `name`; additional fields are `null` when unavailable.

## Consequences

- Only one set of platform readers needs maintenance.
- CI builds two .NET packages instead of a separate Rust toolchain.
- `@sysutils/ps` auto-selects `dotnet-nodeapi` when `node-api-dotnet` and the
  .NET runtime are present, otherwise falls back to the CLI backend.
- The Rust package (`packages/ps-rust`) is removed from source control.
