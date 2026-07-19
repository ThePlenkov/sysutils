import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "tmp-platform-stubs");
const version = process.argv[2] || "0.0.0";

const platforms = [
  ["darwin", "arm64"],
  ["darwin", "x64"],
  ["linux", "arm64"],
  ["linux", "x64"],
  ["win32", "arm64"],
  ["win32", "x64"],
];

fs.mkdirSync(outDir, { recursive: true });

for (const [platform, arch] of platforms) {
  const name = `@sysutils/ps-${platform}-${arch}`;
  const dir = path.join(outDir, name.replace("@", "").replace("/", "-"));
  fs.mkdirSync(dir, { recursive: true });

  const pkg = {
    name,
    version,
    description: `Stub package for ${name}. This reserves the package name and marks the supported OS/CPU. The first real release will be published by CI with the native binaries.`,
    os: [platform],
    cpu: [arch],
    files: ["README.md"],
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/sysutils-ts/sysutils.git",
      directory: "packages/ps",
    },
  };

  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
    "utf8",
  );

  fs.writeFileSync(
    path.join(dir, "README.md"),
    `# ${name}\n\nStub package that reserves the platform-specific package name for \`@sysutils/ps\`.\nThe actual native binaries are built and published by CI.\n`,
    "utf8",
  );

  console.log(`Created ${dir}`);
}

console.log(`\nTo publish, run in each directory:\n`);
console.log(`  cd tmp-platform-stubs/<package-dir>`);
console.log(`  npm publish --access public`);
console.log(`\nOr use this PowerShell loop from the repo root:\n`);
console.log(
  `  Get-ChildItem -Directory tmp-platform-stubs | ForEach-Object { Push-Location $_.FullName; npm publish --access public; Pop-Location }`,
);
console.log(`\nOr this bash loop:\n`);
console.log(
  `  for d in tmp-platform-stubs/*; do (cd "$d" && npm publish --access public); done`,
);
