import { resolve } from "node:path";

/**
 * 项目的根目录
 */
export const ROOT = process.cwd();

/**
 * 文档目录
 */
export const DOCS = resolve(ROOT, "docs");
