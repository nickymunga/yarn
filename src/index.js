import { fork } from "child_process";
import { join as pathJoin } from "path";

export async function install() {
  try {
    const child = fork(pathJoin(__dirname, "cli", "index.js"), { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === null || code === 0) {
        return;
      }
      throw new Error(`Exited with code ${code}`);
    })
  } catch (e) {
    throw new Error(e);
  }
}

install()
