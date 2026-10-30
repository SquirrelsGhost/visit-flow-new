import { execSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const PORTS = [3001];
const SELF_PIDS = new Set([process.pid, process.ppid]);

function ensureNextInstalled() {
  const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) {
    console.log("[predev-guard] Next.js Binary fehlt — führe 'npm install' aus...");
    execSync("npm install", { stdio: "inherit" });
  }
}

function freeZombiePorts() {
  if (process.platform === "win32") {
    try {
      const output = execSync("netstat -ano", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      const pidsToKill = new Set();

      for (const line of output.split(/\r?\n/)) {
        if (!line.includes("ABHÖREN") && !line.includes("LISTENING")) continue;
        const matchesPort = PORTS.some((port) => line.includes(`:${port} `));
        if (!matchesPort) continue;

        const parts = line.trim().split(/\s+/);
        const pid = Number(parts[parts.length - 1]);
        if (Number.isInteger(pid) && pid > 0 && !SELF_PIDS.has(pid)) {
          pidsToKill.add(pid);
        }
      }

      for (const pid of pidsToKill) {
        try {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
          console.log(`[predev-guard] Alter Prozess auf Port ${PORTS.join("/")} beendet (PID ${pid}).`);
        } catch {
          // Prozess bereits beendet
        }
      }
    } catch {
      // netstat nicht verfügbar oder keine Treffer
    }
  } else {
    for (const port of PORTS) {
      try {
        const out = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
        for (const rawPid of out.split(/\r?\n/)) {
          const pid = Number(rawPid.trim());
          if (Number.isInteger(pid) && pid > 0 && !SELF_PIDS.has(pid)) {
            try {
              process.kill(pid, "SIGKILL");
              console.log(`[predev-guard] Alter Prozess auf Port ${port} beendet (PID ${pid}).`);
            } catch {
              // Ignorieren
            }
          }
        }
      } catch {
        // Kein Prozess auf diesem Port
      }
    }
  }
}

function cleanNextDevLock() {
  const nextDevLock = join(process.cwd(), ".next", "dev", "lock");
  if (existsSync(nextDevLock)) {
    try {
      rmSync(nextDevLock, { force: true });
      console.log("[predev-guard] .next/dev/lock bereinigt (Turbopack-Cache bleibt erhalten).");
    } catch (err) {
      console.warn("[predev-guard] Konnte .next/dev/lock nicht löschen:", err?.message ?? err);
    }
  }
}

ensureNextInstalled();
freeZombiePorts();
cleanNextDevLock();
