import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const binExt = process.platform === "win32" ? ".cmd" : "";
const tsxBin = path.resolve(rootDir, "node_modules", ".bin", `tsx${binExt}`);

if (!fs.existsSync(tsxBin)) {
  console.error("Could not find the tsx CLI. Make sure dependencies are installed with 'npm install'.");
  process.exit(1);
}

const child = spawn(tsxBin, ["server/index.ts"], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "development",
  },
});

child.on("close", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
