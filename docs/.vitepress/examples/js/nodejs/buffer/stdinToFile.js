import { createWriteStream } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

// 创建可写流
const outputStream = createWriteStream(
  // 使用绝对路径
  resolve(fileURLToPath(import.meta.url), "../output.txt")
);
// 将标准输入流管道到可写流
process.stdin.pipe(outputStream);
