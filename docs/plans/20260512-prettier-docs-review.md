# Prettier 文档 & 幻灯片审查计划（对照 v3.8.3）

## Context

用户已完成 Prettier 的 VitePress 文档（index.md / getting-started.md / guideline-base.md / guideline-others.md / reference.md / guideline-adadvance/{configurations.md,integration.md}）和 Slidev 幻灯片（22 slides）。下一步要生产 Quiz 题目，但题目应基于"已经核对过最新文档"的内容来出。

本次审查对照 https://prettier.io/docs/ 全部章节抓回的要点（最新稳定版 v3.8.3，2026-05-12 抓取），仅列**真实存在的差异**（事实性错误、版本相关遗漏、过时建议、笔误等），不重写整体结构。

---

## 一、各文件差异清单

### `index.md`

| #   | 问题                                                                                     | 严重度 | 说明                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "缺点"里写 "**通过插件**（如 `eslint-plugin-prettier`）解决与其他 Linter 的格式规则冲突" | 中     | 这条措辞过时。官方现在明确把 `eslint-plugin-prettier` 列为"现在过时"的方案，推荐 `eslint-config-prettier`。建议改为 "需要额外的 `eslint-config-prettier` 配置才能避免与 ESLint 的规则冲突"。 |
| 2   | 缺少版本号标注                                                                           | 低     | 对照 lint-staged 笔记 "基于 lint-staged v16.4.0 编写"，本页可加一行 "基于 Prettier v3.8.3 编写"（或放到 getting-started.md 顶部）。                                                          |

### `getting-started.md`

| #   | 问题                                                                                              | 严重度 | 说明                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 顶部缺版本号                                                                                      | 低     | 参考 lint-staged getting-started.md 第 8 行格式，加 `> 基于 Prettier v3.8.3 编写`。                                                                                                                                                                                  |
| 2   | "配置文件" 段落列出的格式不全（第 64-68 行）                                                      | 中     | 现在列了 8 种，官方支持 17+ 种文件名变体（`.prettierrc.json5`、`.prettierrc.yml`、`.prettierrc.mjs/.mts/.cjs/.cts`、`prettier.config.mjs/.mts/.cjs/.cts` 等）。本页是"入门"性质，不必逐一列，但应注明"完整列表见 [配置](../guideline-adadvance/configurations.md)"。 |
| 3   | 速查里 "配置：`prettier.config.ts` / `.prettierrc`"，但 `.prettierrc` 默认是 JSON/YAML，而非 TS   | 低     | 与 (2) 同因，可与 (2) 一起处理（速查保留两个最常见即可，不必修改）。                                                                                                                                                                                                 |
| 4   | "如果 Prettier 运行目录中包含 `.gitignore`，则 `.gitignore` 中的规则会被默认包含" （第 42-44 行） | 中     | **需要 fact-check**：从 Prettier v3.1 起，行为是 "仅当没有 `.prettierignore` 且未指定 `--ignore-path` 时，才使用 `.gitignore`"。建议改写为更精确的版本（在 configurations.md 1191 行的"如果存在 `.gitignore` 文件" 同样需要核实改写）。                              |
| 5   | "搭配 Git Hooks" 区块只提到 husky + lint-staged（第 130-148 行）                                  | 低     | 官方 Pre-commit Hook 页面列了 5 种方案。建议追加一句脚注 "其他方案如 git-format-staged、pretty-quick、simple-git-hooks 见官方文档"。                                                                                                                                 |

### `guideline-base.md`

| #   | 问题                                                                                                                                                       | 严重度 | 说明                                                                                                                                                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "不合理选项举例" 没标注 `--bracket-same-line` 已合并到 `--bracket-same-line` 并取代 `--jsx-bracket-same-line`，且 `--jsx-bracket-same-line` 在 v2.4.0 弃用 | 中     | 实际 `--bracket-same-line` 仍是当前推荐选项，已**不是历史遗留**。官方 Option Philosophy 仍把它列为"曾被合理化但引发摩擦"的选项 — 措辞 OK，但读者容易误以为是被废弃的。建议在 `--bracket-same-line` 这条下加一句："但当前仍是有效选项，已替代 v2.4.0 弃用的 `--jsx-bracket-same-line`"。 |
| 2   | 第 153 行 "**选项**：`objectWrap` 可禁用此行为"，措辞不准                                                                                                  | 低     | `objectWrap` 的可选值是 `preserve`（默认）/`collapse`，把它说成"可禁用"会让读者以为存在 `false`。建议改为 "**选项**：可通过 `objectWrap: "collapse"` 在能放下时折回单行"。                                                                                                              |
| 3   | 缺版本号                                                                                                                                                   | 低     | 同 index.md。                                                                                                                                                                                                                                                                           |

### `guideline-others.md`

| #   | 问题                                                                           | 严重度 | 说明                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 第 21-23 行 `npm install --save-dev prettier`                                  | 中     | 官方 Install 页明确推荐 `--save-exact`（精确版本）。为与 getting-started.md `-E` 一致，建议改为 `npm install --save-dev --save-exact prettier` 或 `pnpm add -D -E prettier`。         |
| 2   | "**额外功能**: 安装 vscode-status-bar-format-toggle 可开关格式化" （第 30 行） | 低     | 官方文档（Editors 页 / VS Code 段）没有提到这个第三方扩展，是过往加的拓展信息。**保留**，但建议标注 "(可选第三方扩展)"。                                                              |
| 3   | "编辑器" 仅含 VSCode + WebStorm                                                | 低     | 官方 Editors 页还列了 Emacs / Vim / Helix / Sublime / VS / Espresso。本页是"其他/速查"性质，可在末尾加一句 "其他编辑器请参阅 [官方 Editors 文档](https://prettier.io/docs/editors)"。 |
| 4   | "相关项目" 列表（第 99-127 行）和官方 Related Projects 页对齐情况              | 低     | 整体一致，但官方列表还包括 `reviewdog-action-prettier` 等。已包含，**无需修改**。                                                                                                     |

### `reference.md`

| #   | 问题                                                                                                     | 严重度 | 说明                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 第 67 行 "**否则作为 glob 模式解析**: 如果路径既不是文件也不是目录，则按 `fast-glob` 的 `glob` 语法解析" | 低     | 官方 CLI 页确实说用 fast-glob 解析，描述正确，可保留。                                                                                                                                                                                     |
| 2   | 第 295 行 "文件的内容（如果 `--cache-strategy content`）"                                                | **高** | **事实错误**：官方 CLI 页 `--cache-strategy` 默认值是 `metadata`（而非 `content`），且本页第 330 行又写成 "`content`：使用文件内容，**默认策略**" — 与官方相反。建议核对 Prettier 源码或文档，统一改为 metadata 默认（或加引用链接证实）。 |
| 3   | 第 300 行 "不带 `--catch` 运行 Prettier"                                                                 | **高** | **笔误**：`--catch` → `--cache`。                                                                                                                                                                                                          |
| 4   | `prettier.getSupportInfo()` 描述只列 `languages`，但官方 API 同时还返回 `options`                        | 中     | 官方 `getSupportInfo()` 返回值实际包含 `{ languages, options }`（其中 options 列出支持选项的元数据）。可补充。                                                                                                                             |
| 5   | "速查" 第 19-24 行缺 `prettier.getSupportInfo()`、`prettier.clearConfigCache()`                          | 低     | 不严重，但既然下方介绍了，可同步补到速查。                                                                                                                                                                                                 |

### `guideline-adadvance/configurations.md`

| #   | 问题                                                                                    | 严重度 | 说明                                                                                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 第 14 行速查 "**属性名引号**：`consistent："as-needed"`"                                | **高** | **字段名错乱**：选项名是 `quoteProps`，默认值 `"as-needed"`，可选 `consistent/preserve`。本行写成 `consistent："as-needed"` 是把可选值当字段名了。改为 "`quoteProps: "as-needed"`"。                                                |
| 2   | 第 32 行速查 "使用 TS 配置文件：`--experimental-strip-types`"                           | 中     | 此说法在 Node 22.6 - 24.2 区间正确，但 **Node ≥ 24.3.0 不再需要** `--experimental-strip-types`（Node 原生执行 TS）。建议改为 "Node ≥ 22.6.0 支持 TS 配置；Node 22.6–24.2 需 `--experimental-strip-types`，Node ≥ 24.3.0 原生支持"。 |
| 3   | 第 700-715 行 "TypeScript 配置文件的特殊要求"                                           | 中     | 同 (2)，正文也需更新。官方 Configuration File 页现在的描述更细。                                                                                                                                                                    |
| 4   | **缺失选项 `checkIgnorePragma`**                                                        | **高** | v3.6.0+ 新增配置项 `checkIgnorePragma`（默认 `false`）：若启用，遇到 `@noprettier`/`@noformat` pragma 会被识别为 ignore。本页完全没收录。需要新增一节。                                                                             |
| 5   | 第 269 行 trailing-comma "需要 ES2017+ 环境（Node.js 8+ 或现代浏览器）"                 | 低     | 没问题但 "Node 8+" 描述很旧，可以删掉 Node 版本（v3 默认 trailing-comma=all 后，多数现代项目已不在意）。                                                                                                                            |
| 6   | 第 1188-1192 行 "如果存在 `.gitignore` 文件，Prettier 会自动遵循其中的规则"             | 中     | 同 getting-started (4)：v3.1+ 仅当没有 `.prettierignore` 且未指定 `--ignore-path` 时使用 `.gitignore`。需要 fact-check 并精确化。                                                                                                   |
| 7   | 第 1186 行 "**默认忽略**：版本控制系统目录（如`.git`, `.svn`, `.hg`）和 `node_modules`" | 低     | ✓ 与官方一致。                                                                                                                                                                                                                      |

### `guideline-adadvance/integration.md`

| #   | 问题                                                                                                                   | 严重度 | 说明                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 第 142 行 "**ES Modules**：`standalone.mjs`（v3.0+，v2.x 为 `esm/standalone.mjs`）" / "UMD：`standalone.js`（v1.13+）" | -      | ✓ 与官方 Browser 页一致。                                                                                                                                                                                              |
| 2   | "插件" 列表（第 104-125 行）                                                                                           | 低     | 与官方 Plugins 页基本一致，社区插件略有出入但属于动态列表，可不更新。                                                                                                                                                  |
| 3   | "GitLab CI 配置" 段落（第 312-337 行）                                                                                 | 中     | 官方 Run on CI 页只列了 GitHub Actions + autofix.ci。**本页的 GitLab 段落是你自己写的扩展**（不是官方推荐），不算"差错"，但要注意脚本里 `git push origin $CI_COMMIT_REF_NAME` 在受保护分支上会失败，建议加个 warning。 |

### Slidev `slides.md`

| #   | 问题                                                                            | 严重度 | 说明                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 第 244-247 行 `prettier.format(source, options)` 写成同步调用                   | **高** | **事实错误**：Prettier v3 起所有公共 API 都是异步。应改为 `await prettier.format(source, options)`，或在 `(async () => { ... })()` 包装中演示。                                                                                                                                                   |
| 2   | 第 132-146 行 magic-move 演示 — `words.prefix + name + words.suffix;` 拆成 3 行 | 低     | Prettier 默认不会把 80 字符内的字符串拼接拆行。演示效果是为了视觉冲击，可以保留，但严格说不是 Prettier 真实输出。可在 speaker notes 中标注 "演示效果，非真实格式化结果"。                                                                                                                         |
| 3   | 第 515-525 行 CI 配置写 `HUSKY: 0`                                              | **高** | **副标题/内容偏题**：本页讲的是 "和 CI 集成 — 自动化格式化，提交更规范"，但截图里 `HUSKY: 0` 是用来在 CI 里**禁用** husky 钩子的，与"自动跑 Prettier 然后提交"没逻辑关系。官方推荐 `autofix.ci` GitHub App 自动提交。建议要么改成 `prettier --check`（CI 验证），要么用官方 autofix.ci 模板替换。 |
| 4   | 整片缺版本号                                                                    | 低     | 封面或首页可加 "Prettier v3.x" 标注。                                                                                                                                                                                                                                                             |
| 5   | 第 670 行 "**常用插件** `prettier-plugin-tailwindcss`、`@prettier/plugin-xml`"  | 低     | ✓ 是官方/广泛使用插件，OK。                                                                                                                                                                                                                                                                       |

---

## 二、按严重度分组的修改优先级

### 🔴 必须改（事实错误 / 笔误）

1. ~~`reference.md` `--cache-strategy` 默认值~~ — **已 fact-check：本地写法正确，官方原文 "If no strategy is specified, `content` will be used"**
2. `reference.md` 第 300 行：`--catch` → `--cache` 笔误
3. `configurations.md` 第 14 行速查：`quoteProps` 字段名写错
4. `configurations.md` 缺 `checkIgnorePragma`（v3.6.0+ 新增）
5. `slides.md` 第 244-247 行：`prettier.format` 缺 `await`
6. `slides.md` 第 515-525 行：CI 集成示例与主题不匹配（HUSKY=0 用错地方）

### 🟡 建议改（描述过时 / 信息不全）

7. ~~`.gitignore` fallback~~ — **已 fact-check：官方 "By default, Prettier looks for ./.gitignore and ./.prettierignore"，本地描述与官方一致**
8. `configurations.md` 速查 + `TypeScript 配置文件的特殊要求`：补充 Node ≥ 24.3.0 已不需 `--experimental-strip-types`
9. `index.md` 缺点段："eslint-plugin-prettier" 措辞过时
10. `getting-started.md` 顶部加版本号
11. `guideline-others.md` `npm install` 示例补 `--save-exact`
12. `reference.md` `getSupportInfo()` 补 `options` 返回字段

### 🟢 可选优化（小补充）

13. `guideline-base.md` `objectWrap` 描述措辞
14. `getting-started.md` Git Hooks 段补一句 "还有其他方案见官方文档"
15. `guideline-others.md` 第三方扩展 `vscode-status-bar-format-toggle` 标注 "(可选第三方)"
16. `slides.md` magic-move 演示在 speaker notes 标注"演示效果"

---

## 三、本地需要进一步 fact-check 的两个点

1. **`.gitignore` fallback 行为的确切版本与条件**：官方文档现在的措辞应是 v3.1 起改变。需要看 prettier-3.x 的 CHANGELOG 或对 v3.8.3 的 docs/ignore 页面再 WebFetch 一次确认。
2. **`--cache-strategy` 的默认值**：官方 CLI 文档列了 `metadata|content` 但未明确写 default 字眼。可在 prettier 源码 `src/cli/options.js` 或 GitHub README 上找确切 default。

---

## 四、与 Quiz 题目生产的关系

修完上述 🔴 项之后，再开始按 husky/lint-staged 节奏出 13 道 Prettier 题，可避免题目里写出与文档不一致的"标准答案"（特别是 `--cache-strategy`、`quoteProps`、`checkIgnorePragma` 这些容易当考点的）。
