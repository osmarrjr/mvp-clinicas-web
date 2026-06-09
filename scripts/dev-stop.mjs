import { execSync } from "node:child_process";

const PORTS = [3000, 3001, 3005];

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

if (killed === 0) {
  console.log("Nenhum servidor dev encontrado nas portas 3000, 3001 ou 3005.");
}
