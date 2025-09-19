import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const entryPoint = path.resolve(rootDir, "dist", "index.js");

if (!fs.existsSync(entryPoint)) {
  console.error("Could not find dist/index.js. Did you run 'npm run build' first?");
  process.exit(1);
}

const child = spawn(process.execPath, [entryPoint], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
});

child.on("close", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
