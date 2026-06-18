/**
 * lint-staged 配置（函数式）
 *
 * 背景：本仓库为 pnpm monorepo，eslint 只装在各 app/包内（apps/quiz-app、
 * apps/quiz-admin、apps/quiz-backend、packages/ui），**根目录无 eslint 可执行**，
 * 因此暂存的 js/ts/vue 文件必须按所属包路由到该包内执行 `pnpm -C <包> exec eslint`。
 * prettier 装在根，json/md/css/scss 直接在根跑即可。
 *
 * 历史坑：旧配置 `pnpm -w -r run lint:eslint` / `pnpm -w -r run format`
 * 引用了根目录不存在的脚本、且会对整个仓库跑 prettier，导致 pre-commit 超时卡死。
 */

import path from "node:path";

/** 装有 eslint 的工作区包（相对仓库根的路径） */
const ESLINT_PACKAGES = [
  "apps/quiz-app",
  "apps/quiz-admin",
  "apps/quiz-backend",
  "packages/ui",
];

/**
 * 把暂存的 js/ts/vue 文件按所属包分组，在各自包内执行 `eslint --fix`。
 * 不属于任何带 eslint 的包的文件（如仓库根脚本）直接跳过。
 * @param {string[]} files lint-staged 传入的暂存文件绝对路径
 * @returns {string[]} 每个相关包一条 eslint 命令
 */
function eslintByPackage(files) {
  const root = process.cwd();
  /** @type {Map<string, string[]>} 包路径 -> 该包下暂存文件 */
  const grouped = new Map();
  for (const file of files) {
    const rel = path.relative(root, file);
    const pkg = ESLINT_PACKAGES.find((p) => rel.startsWith(`${p}/`));
    if (!pkg) continue;
    if (!grouped.has(pkg)) grouped.set(pkg, []);
    grouped.get(pkg).push(file);
  }
  return [...grouped].map(
    ([pkg, pkgFiles]) =>
      `pnpm -C ${pkg} exec eslint --fix ${pkgFiles
        .map((f) => JSON.stringify(f))
        .join(" ")}`,
  );
}

export default {
  "*.{js,ts,vue}": eslintByPackage,
  "*.{json,md,css,scss}": "prettier --write",
};
