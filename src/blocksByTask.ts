import * as fs from "fs";
import * as path from "path";
import supportedTasks from "./supportedTasks";

function absoluteFilePath(filePath: string) {
  return path.resolve(__dirname, "../src/", `${filePath}`);
}

export default function blocksByTask(task: string) {
  if (!supportedTasks.includes(task)) {
    return null;
  }

  if (fs.existsSync(absoluteFilePath(`tasks/${task}/blocks.json`))) {
    return JSON.parse(
      fs.readFileSync(absoluteFilePath(`tasks/${task}/blocks.json`), "utf8")
    );
  }
  return JSON.parse(fs.readFileSync(absoluteFilePath("blocks.json"), "utf8"));
}
