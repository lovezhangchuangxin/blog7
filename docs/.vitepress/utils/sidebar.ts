import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DefaultTheme } from "vitepress";
import { parseFrontmatter, parseH1 } from "./content";

/**
 * 扫描目录，自动构建 sidebar。
 * 同目录下文件的顺序根据 frontmatter 字段中的 order 字段升序排序。
 *
 * @param path 目录路径
 */
export const buildSidebar = (path: string, url: string = "/") => {
  const sidebar: DefaultTheme.Sidebar = {};
  // 扫描目录
  const files = readdirSync(path);
  const mds: {
    filename: string;
    title: string;
    order: number;
  }[] = [];
  files.forEach((file) => {
    const fullPath = resolve(path, file);
    const stat = lstatSync(fullPath);
    if (stat.isDirectory()) {
      Object.assign(sidebar, buildSidebar(fullPath, `${url}${file}/`));
    } else if (stat.isFile() && file.endsWith(".md")) {
      // 读文件，解析 frontmatter
      const content = readFileSync(fullPath, "utf-8");
      const frontmatterData = parseFrontmatter(content);
      const title = parseH1(content);
      mds.push({
        filename: file.replace(/\.md$/, ""),
        title,
        order: frontmatterData.order ? Number(frontmatterData.order) : Infinity,
      });
    }
  });
  // 当前目录至少有两个 md 文件才会生成 sidebar
  if (mds.length > 1) {
    sidebar[url] = mds
      .sort((a, b) => a.order - b.order)
      .map(({ title, filename }) => {
        return {
          text: title,
          link: `${url}${filename}`,
        };
      });
  }

  return sidebar;
};
