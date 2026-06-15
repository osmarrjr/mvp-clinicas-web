import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join, resolve } from "node:path";

const PORTS = [3000, 3001, 3005];
const PROJECT_DIR = resolve(import.meta.dirname, "..");

function collectListeningPids(port) {
  const output = execSync("netstat -ano", { encoding: "utf8" });
  const pids = new Set();

  for (const line of output.split("\n")) {
    if (!line.includes("LISTENING")) continue;
    if (!line.includes(`:${port} `) && !line.includes(`:${port}\t`)) continue;

    const pid = line.trim().split(/\s+/).at(-1);
    if (pid && /^\d+$/.test(pid)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function killPid(pid) {
  if (process.platform === "win32") {
    execSync(
      `powershell.exe -NoProfile -Command "Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue"`,
      { stdio: "ignore" },
    );
    return;
  }

  execSync(`kill -9 ${pid}`, { stdio: "ignore" });
}

function killOrphanNextProcesses() {
  if (process.platform !== "win32") {
    return 0;
  }

  const ps1Path = join(import.meta.dirname, "kill-project-node.ps1");

  try {
    const output = execSync(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${ps1Path}"`,
      { encoding: "utf8" },
    ).trim();

    return Number.parseInt(output, 10) || 0;
  } catch {
    return 0;
  }
}

let killed = 0;

for (const port of PORTS) {
  for (const pid of collectListeningPids(port)) {
    try {
      killPid(pid);
      killed += 1;
      console.log(`Encerrado PID ${pid} (porta ${port})`);
    } catch {
      console.warn(`Não foi possível encerrar PID ${pid} (porta ${port})`);
    }
  }
}

const orphanKilled = killOrphanNextProcesses();
if (orphanKilled > 0) {
  console.log(
    `Encerrados ${orphanKilled} processo(s) Node órfãos do Next.js/projeto.`,
  );
}

try {
  rmSync(resolve(PROJECT_DIR, ".next"), { recursive: true, force: true });
  console.log("Cache .next removido.");
} catch {
  console.warn("Não foi possível remover .next.");
}

if (killed === 0 && orphanKilled === 0) {
  console.log("Nenhum servidor dev encontrado. Cache .next limpo.");
}
