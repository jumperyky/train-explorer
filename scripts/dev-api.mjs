/**
 * バックエンド(FastAPI)の開発サーバーを起動する。
 *
 * `python -m uvicorn ...` を直に叩くと PATH のグローバルPythonが使われ、
 * requirements.txt を入れた .venv ではない環境で動いてしまう
 * （pykakasi が無くてルビAPIが engine=none になる、など）。
 * ここで .venv を優先的に選ぶ。
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";

const venvPython = join(
  ROOT,
  ".venv",
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python",
);

const python = existsSync(venvPython) ? venvPython : isWindows ? "python" : "python3";

if (python !== venvPython) {
  console.warn(
    "[dev:api] .venv が見つかりません。PATH の Python を使います。\n" +
      "          セットアップ: python -m venv .venv && " +
      (isWindows ? ".venv\\Scripts\\python" : ".venv/bin/python") +
      " -m pip install -r requirements.txt\n",
  );
}

const args = ["-m", "uvicorn", "api.index:app", "--reload", "--port", process.env.API_PORT ?? "8000"];
console.log(`[dev:api] ${python} ${args.join(" ")}`);

const child = spawn(python, args, { cwd: ROOT, stdio: "inherit" });

child.on("error", (err) => {
  console.error(`[dev:api] 起動に失敗しました: ${err.message}`);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 0));
