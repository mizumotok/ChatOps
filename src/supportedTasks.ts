import * as fs from "fs";
import * as path from "path";

function absoluteFilePath(filePath: string) {
  return path.resolve(__dirname, "../src/", `${filePath}`);
}

const taskDirs = fs.readdirSync(absoluteFilePath("../src/tasks"));

export default taskDirs;
