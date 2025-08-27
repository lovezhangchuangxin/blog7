import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

/**
 * 图片 buffer 转 base64
 */
const transformPic = (buffer) => {
  return buffer.toString("base64");
};

// 读取图片文件，得到 buffer
const buffer = readFileSync(
  resolve(fileURLToPath(import.meta.url), "../aqing.ico")
);
// buffer 转 base64
const base64 = transformPic(buffer);
// 图片的媒体类型，如果你使用其他类型的图片，记得换成相应的格式
// 比如：png图片 -> image/png, jpg图片 -> image/jpeg
const mimeType = "image/x-icon";
// html 模版，组装 base64 到图片
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <img src="data:${mimeType};base64,${base64}" alt="" />
  </body>
</html>
`;
// 将生成的 HTML 写入文件，方便查看效果
writeFileSync(
  resolve(fileURLToPath(import.meta.url), "../tranformPic.html"),
  HTML_TEMPLATE
);
