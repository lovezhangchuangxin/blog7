/**
 * frontmatter 正则
 */
export const frontmatterRE = /^\s*---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;

/**
 * 字符串属性正则
 */
export const stringPropertyRE = /^\s*([\w-]+)\s*:\s*(.+)\s*$/gm;

/**
 * 一级标题正则
 */
export const h1RE = /^#\s+(.*)$/m;

/**
 * 解析 frontmatter
 *
 * @param content 文件内容
 * @returns
 */
export const parseFrontmatter = (content: string) => {
  const frontmatter: Record<string, string> = {};
  const match = content.match(frontmatterRE);
  if (match) {
    const raw = match[1];
    for (const propMatch of raw.matchAll(stringPropertyRE)) {
      frontmatter[propMatch[1]] = propMatch[2];
    }
  }
  return frontmatter;
};

/**
 * 解析一级标题
 *
 * @param content 文件内容
 * @returns
 */
export const parseH1 = (content: string) => {
  const match = content.match(h1RE);
  return match ? match[1] : "";
};
