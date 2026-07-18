import assert from "node:assert";
import test from "node:test";
import { createProcessStream, getBinaryPath, listProcesses } from "./index.js";

test("getBinaryPath returns a path only when the native binary exists", () => {
  const dotnet = getBinaryPath("dotnet");
  const dotnetNodeApi = getBinaryPath("dotnet-nodeapi");
  if (dotnet !== undefined) assert.strictEqual(typeof dotnet, "string");
  if (dotnetNodeApi !== undefined)
    assert.strictEqual(typeof dotnetNodeApi, "string");
});

test("createProcessStream works when a backend binary is available", async () => {
  const cliBackend = getBinaryPath("dotnet") ? "dotnet" : undefined;
  if (!cliBackend) {
    assert.throws(
      () => createProcessStream(),
      /No @sysutils\/ps backend found/,
    );
    return;
  }

  const procs = await listProcesses({
    backend: cliBackend,
    fields: ["pid", "name"],
  });
  assert.ok(procs.length > 0);
  assert.ok(
    procs.every((p) => typeof p.pid === "number" && typeof p.name === "string"),
  );
});

test("createProcessStream throws for an explicit backend without a binary", () => {
  if (getBinaryPath("dotnet")) {
    return;
  }
  assert.throws(
    () => createProcessStream({ backend: "dotnet" }),
    /native binary is missing/,
  );
});

test("listProcesses works with dotnet-nodeapi when the assembly is available", async () => {
  if (!getBinaryPath("dotnet-nodeapi")) {
    return;
  }
  const procs = await listProcesses({
    backend: "dotnet-nodeapi",
    fields: ["pid", "name"],
  });
  assert.ok(procs.length > 0);
  assert.ok(
    procs.every((p) => typeof p.pid === "number" && typeof p.name === "string"),
  );
});
