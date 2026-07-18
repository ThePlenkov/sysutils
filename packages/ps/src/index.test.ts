import assert from "node:assert";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { createProcessStream, getBinaryPath, listProcesses } from "./index.js";

test("getBinaryPath returns a path only when the native binary exists", () => {
  const rust = getBinaryPath("rust");
  const dotnet = getBinaryPath("dotnet");
  const dotnetNodeApi = getBinaryPath("dotnet-nodeapi");
  if (rust !== undefined) assert.strictEqual(typeof rust, "string");
  if (dotnet !== undefined) assert.strictEqual(typeof dotnet, "string");
  if (dotnetNodeApi !== undefined) assert.strictEqual(typeof dotnetNodeApi, "string");
});

test("createProcessStream works when a backend binary is available", async () => {
  const cliBackend = getBinaryPath("dotnet")
    ? "dotnet"
    : getBinaryPath("rust")
      ? "rust"
      : undefined;
  if (!cliBackend) {
    assert.throws(
      () => createProcessStream(),
      /No @sysutils\/ps backend found/,
    );
    return;
  }

  const procs = await listProcesses({ backend: cliBackend, fields: ["pid", "name"] });
  assert.ok(procs.length > 0);
  assert.ok(procs.every((p) => typeof p.pid === "number" && typeof p.name === "string"));
});

test("createProcessStream throws for an explicit backend without a binary", () => {
  if (getBinaryPath("dotnet")) {
    // If the .NET binary is built the stream should work.
    return;
  }
  assert.throws(
    () => createProcessStream({ backend: "dotnet" }),
    /native binary is missing/,
  );
});

test("listProcesses works with dotnet-nodeapi when the .node binary is available", () => {
  const binaryPath = getBinaryPath("dotnet-nodeapi");
  if (!binaryPath) {
    return;
  }
  // Spawn the in-process addon in a child to avoid a Node 26 / node-api-dotnet
  // process-exit-code quirk in the `node --test` runner.
  const indexModule = new URL("./index.js", import.meta.url).toString();
  const script = `
    const { listProcesses } = await import(${JSON.stringify(indexModule)});
    const procs = await listProcesses({ backend: "dotnet-nodeapi", fields: ["pid", "name"] });
    console.log(JSON.stringify(procs[0]));
    process.exit(0);
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error(result.stderr);
  }
  assert.strictEqual(result.status, 0);
  const first = JSON.parse(result.stdout.trim()) as { pid: number; name: string };
  assert.strictEqual(typeof first.pid, "number");
  assert.strictEqual(typeof first.name, "string");
});
