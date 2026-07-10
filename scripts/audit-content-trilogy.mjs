#!/usr/bin/env node
/**
 * 三仓库内容工程统一只读审计。
 *
 * 以 VitePress 技术节点为主键，合并 Slidev 自动质量信号与 Quiz 本地内容审计。
 * 该脚本不连接数据库、不执行导入，也不部署任何产物。
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const quizRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const websiteRoot =
  process.env.ILLEGAL_WEBSITE_ROOT ??
  "/Users/zhangxu/workspace/IllegalCreedWebsite";
const slideStackRoot =
  process.env.SLIDESTACK_ROOT ?? "/Users/zhangxu/workspace/SlideStack";
const outputRoot = path.join(quizRoot, "docs", "audits");
const registryPath = path.join(outputRoot, "content-node-registry.json");
const reportPath = path.join(outputRoot, "20260710-content-audit-baseline.md");

/** 执行返回 JSON 的本地命令。 */
function runJson(label, command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} 执行失败：\n${result.stderr || result.stdout}`);
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `${label} 未输出合法 JSON：${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** 读取仓库当前提交与工作区状态，作为报告来源指纹。 */
function readGitState(repoRoot) {
  const commit = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const status = spawnSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return {
    root: repoRoot,
    commit: commit.stdout.trim(),
    dirtyFiles: status.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

/** 与 VitePress 链接生成、Quiz 前端匹配保持一致的 slug 规则。 */
function createCategorySlug(value) {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/#/g, " sharp ")
    .replace(/@/g, " ")
    .replace(/\./g, "-")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** 生成匹配分类或包名时使用的候选 key。 */
function categoryKeys(value) {
  const raw = value.trim().toLowerCase();
  const slug = createCategorySlug(value);
  return new Set([raw, slug, slug.replace(/-/g, "")].filter(Boolean));
}

/** 解码 URL 查询参数，非法编码则保留原值。 */
function decodeCategory(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value;
  }
}

/** 按 Quiz 前端的精确、紧凑与保守前缀规则匹配分类叶子。 */
function matchCategoryLeaf(rawValue, leafNames) {
  if (!rawValue) return null;
  const targetKeys = categoryKeys(rawValue);
  const exact = leafNames.find((leaf) => {
    const leafKeys = categoryKeys(leaf);
    return [...targetKeys].some((key) => leafKeys.has(key));
  });
  if (exact) return exact;

  const targetSlug = createCategorySlug(rawValue);
  if (targetSlug.length < 3) return null;
  return (
    leafNames.find((leaf) => {
      const leafSlug = createCategorySlug(leaf);
      return (
        leafSlug.length >= 3 &&
        (targetSlug.startsWith(`${leafSlug}-`) ||
          leafSlug.startsWith(`${targetSlug}-`))
      );
    }) ?? null
  );
}

/** 将技术首页对应的内容页分配给最深层技术目录，避免父目录重复计数。 */
function assignContentPages(techPages, allPages) {
  const directories = techPages
    .map((page) => ({
      file: page.file,
      directory: path.posix.dirname(page.file),
    }))
    .sort((a, b) => b.directory.length - a.directory.length);
  const assignments = new Map(techPages.map((page) => [page.file, []]));
  const unassigned = [];

  for (const page of allPages.filter(
    (candidate) => candidate.quickCheckRequired,
  )) {
    const owner = directories.find(({ directory }) =>
      page.file.startsWith(`${directory}/`),
    );
    if (owner) assignments.get(owner.file).push(page);
    else unassigned.push(page);
  }
  return { assignments, unassigned };
}

/** 在未显式链接时，根据题库文件、目录名和标题发现对应 Slidev 包。 */
function discoverSlidePackage(node, matchedLeaf, quizFiles, slidePackages) {
  const directoryName = path.posix.basename(path.posix.dirname(node.file));
  const candidates = [
    ...quizFiles.map((file) => `${file.techKey}-slide`),
    `${directoryName}-slide`,
    node.quizCategoryDecoded
      ? `${createCategorySlug(node.quizCategoryDecoded)}-slide`
      : null,
    matchedLeaf ? `${createCategorySlug(matchedLeaf)}-slide` : null,
    `${createCategorySlug(node.title)}-slide`,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (slidePackages.has(candidate)) return candidate;
  }

  const candidateKeys = new Set(
    candidates.flatMap((candidate) => [
      ...categoryKeys(candidate.replace(/-slide$/, "")),
    ]),
  );
  const fuzzy = [...slidePackages].filter((packageName) => {
    const packageKeys = categoryKeys(packageName.replace(/-slide$/, ""));
    return [...candidateKeys].some((key) => packageKeys.has(key));
  });
  return fuzzy.length === 1 ? fuzzy[0] : null;
}

/** 转义 Markdown 表格单元格。 */
function tableCell(value) {
  return String(value ?? "-")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, " ");
}

/** 输出 Markdown 列表。 */
function markdownList(items, render) {
  if (items.length === 0) return "_无_";
  return items.map((item) => `- ${render(item)}`).join("\n");
}

/** 渲染 M0 汇总报告。 */
function renderReport(registry) {
  const unmatchedQuiz = registry.nodes.filter((node) => !node.quiz.matchedLeaf);
  const missingSlideLinks = registry.nodes.filter(
    (node) => !node.slide.linkedPackage && node.slide.packageExists,
  );
  const missingSlidePackages = registry.nodes.filter(
    (node) => !node.slide.packageExists,
  );
  const lowestSlides = registry.nodes
    .filter((node) => node.slide.audit)
    .sort((a, b) => a.slide.audit.score - b.slide.audit.score)
    .slice(0, 60);
  const priorityRows = Object.entries(registry.summary.priorities)
    .map(([priority, count]) => `| ${priority} | ${count} |`)
    .join("\n");
  const gradeRows = Object.entries(registry.summary.slideGrades)
    .map(([grade, count]) => `| ${grade} | ${count} |`)
    .join("\n");
  const quizIssueRows = Object.entries(registry.quiz.issueCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => `| ${code} | ${count} |`)
    .join("\n");
  const lowestRows = lowestSlides
    .map(
      (node) =>
        `| ${tableCell(node.title)} | ${node.slide.package} | ${node.slide.audit.score} | ${node.slide.audit.grade} | ${tableCell(node.slide.audit.riskFlags.join(", "))} |`,
    )
    .join("\n");

  return `# 三仓库内容审计 M0 基线

> 生成时间：${registry.generatedAt}
> 范围：本地文件只读；未连接数据库，未执行导入、清理或部署。
> Slidev 分数为自动启发式基线，仅用于安排人工审阅优先级。

## 仓库指纹

| 仓库 | 提交 | 生成时工作区改动数 |
| --- | --- | ---: |
| Quiz | ${registry.repositories.quiz.commit.slice(0, 12)} | ${registry.repositories.quiz.dirtyFiles.length} |
| VitePress | ${registry.repositories.website.commit.slice(0, 12)} | ${registry.repositories.website.dirtyFiles.length} |
| Slidev | ${registry.repositories.slideStack.commit.slice(0, 12)} | ${registry.repositories.slideStack.dirtyFiles.length} |

## 总览

| 指标 | 数量 |
| --- | ---: |
| VitePress 技术节点 | ${registry.summary.nodes} |
| VitePress 内容页 | ${registry.website.totals.contentPages} |
| 免速查 / 缺失 / 位置异常 / 空速查 | ${registry.website.totals.excludedQuickCheck} / ${registry.website.totals.missingQuickCheck} / ${registry.website.totals.misplacedQuickCheck} / ${registry.website.totals.emptyQuickCheck} |
| Slidev 套件 / 页面 | ${registry.slidev.totals.decks} / ${registry.slidev.totals.slides} |
| VitePress 已展示幻灯片链接 | ${registry.website.totals.slideLinks} |
| 漏链但可发现 Slidev 包 | ${missingSlideLinks.length} |
| 无法找到 Slidev 包 | ${missingSlidePackages.length} |
| Quiz JSON / 题目 | ${registry.quiz.totals.files} / ${registry.quiz.totals.questions} |
| Quiz 本地错误 / 警告 | ${registry.quiz.totals.errors} / ${registry.quiz.totals.warnings} |
| Quiz 分类未匹配节点 | ${unmatchedQuiz.length} |
| 孤立 Slidev 包 / Quiz JSON | ${registry.orphans.slidePackages.length} / ${registry.orphans.quizFiles.length} |

## 优先级

| 优先级 | 技术节点数 |
| --- | ---: |
${priorityRows}

优先级含义：P0 为映射或本地结构错误；P1 为速查缺失/空速查或 Slidev D；P2 为速查位置异常、Slidev C 或首页漏链；P3 为当前自动规则未发现阻断项。

## Slidev 初步等级

| 等级 | 套件数 |
| --- | ---: |
${gradeRows}

内部参考 \`prettier-slide\`：${registry.slidev.benchmark.score} 分 / ${registry.slidev.benchmark.grade}。自动基线已识别其分步代码、magic-move、布局多样性、讲稿和引用优势。

## Quiz 本地规则

| 规则 | 命中数 |
| --- | ---: |
${quizIssueRows || "| - | 0 |"}

当前 warning 需要按规则分层复核；它们不等同于事实错误。所有 error 才是本地结构阻断项。

## 分类未匹配

${markdownList(unmatchedQuiz, (node) => `\`${node.website.file}\`：参数 \`${node.quiz.categoryParamDecoded ?? "-"}\``)}

## 幻灯片首页漏链

以下技术已有 Slidev 包，但 VitePress 首页尚未展示幻灯片链接：

${markdownList(missingSlideLinks, (node) => `\`${node.website.file}\` → \`${node.slide.package}\``)}

## 无法找到幻灯片包

${markdownList(missingSlidePackages, (node) => `\`${node.website.file}\`（${node.title}）`)}

## 孤立内容

Slidev：${markdownList(registry.orphans.slidePackages, (item) => `\`${item}\``)}

Quiz：${markdownList(registry.orphans.quizFiles, (item) => `\`${item}\``)}

未分配给技术节点的 VitePress 内容页：${registry.orphans.vitepressContentPages.length}。

## Slidev 优先人工审阅

| 技术 | 套件 | 分数 | 等级 | 风险信号 |
| --- | --- | ---: | --- | --- |
${lowestRows}

## 下一检查点

1. 校准 VitePress 特殊页面速查范围并修复位置异常。
2. 以 Prettier 为内部参考，完成 TypeScript、JSON、Three.js 三套样板。
3. 样板验收后进入 VitePress 和 Slidev 分批治理。
`;
}

const website = runJson(
  "VitePress 审计",
  process.execPath,
  [path.join(websiteRoot, "scripts", "audit-vitepress-content.mjs"), "--json"],
  websiteRoot,
);
const slidev = runJson(
  "Slidev 审计",
  process.execPath,
  [path.join(slideStackRoot, "scripts", "audit-slidev-quality.mjs"), "--json"],
  slideStackRoot,
);
const quiz = runJson(
  "Quiz 内容审计",
  process.execPath,
  [
    "-r",
    "ts-node/register",
    path.join(
      quizRoot,
      "apps",
      "quiz-backend",
      "scripts",
      "audit-content-local.ts",
    ),
    "--json",
  ],
  path.join(quizRoot, "apps", "quiz-backend"),
);

const techPages = website.techIndexPages;
const { assignments, unassigned } = assignContentPages(
  techPages,
  website.pages,
);
const technicalLeaves = quiz.categoryLeaves
  .filter((leaf) => leaf.group === "技术方向")
  .map((leaf) => leaf.name);
const quizFilesByLeaf = new Map();
for (const file of quiz.files) {
  for (const leaf of file.technicalCategories) {
    const current = quizFilesByLeaf.get(leaf) ?? [];
    current.push(file);
    quizFilesByLeaf.set(leaf, current);
  }
}
const slideAuditByPackage = new Map(
  slidev.decks.map((deck) => [deck.package, deck]),
);
const slidePackages = new Set(slideAuditByPackage.keys());

const nodes = techPages.map((page) => {
  const contentPages = assignments.get(page.file) ?? [];
  const quizCategoryDecoded = decodeCategory(page.quizCategory);
  const matchedLeaf = matchCategoryLeaf(quizCategoryDecoded, technicalLeaves);
  const quizFiles = matchedLeaf ? (quizFilesByLeaf.get(matchedLeaf) ?? []) : [];
  const linkedPackage = page.slidePackage;
  const discoveredPackage = linkedPackage
    ? null
    : discoverSlidePackage(
        { ...page, quizCategoryDecoded },
        matchedLeaf,
        quizFiles,
        slidePackages,
      );
  const slidePackage = linkedPackage ?? discoveredPackage;
  const slideAudit = slidePackage
    ? (slideAuditByPackage.get(slidePackage) ?? null)
    : null;
  const quickCheck = {
    total: contentPages.length,
    ok: contentPages.filter((item) => item.quickCheckStatus === "ok").length,
    missing: contentPages.filter((item) => item.quickCheckStatus === "missing")
      .length,
    misplaced: contentPages.filter(
      (item) => item.quickCheckStatus === "misplaced",
    ).length,
    empty: contentPages.filter((item) => item.quickCheckStatus === "empty")
      .length,
    missingFiles: contentPages
      .filter((item) => item.quickCheckStatus === "missing")
      .map((item) => item.file),
    misplacedFiles: contentPages
      .filter((item) => item.quickCheckStatus === "misplaced")
      .map((item) => item.file),
    emptyFiles: contentPages
      .filter((item) => item.quickCheckStatus === "empty")
      .map((item) => item.file),
  };
  const quizErrorCount = quizFiles.reduce(
    (total, file) => total + file.errorCount,
    0,
  );
  const quizWarningCount = quizFiles.reduce(
    (total, file) => total + file.warningCount,
    0,
  );
  const issues = [];
  if (quickCheck.missing > 0) issues.push("vitepress-quick-check-missing");
  if (quickCheck.misplaced > 0) issues.push("vitepress-quick-check-misplaced");
  if (quickCheck.empty > 0) issues.push("vitepress-quick-check-empty");
  if (!linkedPackage && slidePackage)
    issues.push("vitepress-slide-link-missing");
  if (!slideAudit) issues.push("slide-package-missing");
  if (slideAudit?.grade === "D") issues.push("slide-quality-d");
  if (slideAudit?.grade === "C") issues.push("slide-quality-c");
  if (!matchedLeaf) issues.push("quiz-category-unmatched");
  if (quizFiles.length === 0) issues.push("quiz-content-missing");
  if (quizErrorCount > 0) issues.push("quiz-local-errors");

  let priority = "P3";
  if (
    issues.some((issue) =>
      [
        "slide-package-missing",
        "quiz-category-unmatched",
        "quiz-content-missing",
        "quiz-local-errors",
      ].includes(issue),
    )
  ) {
    priority = "P0";
  } else if (
    issues.includes("vitepress-quick-check-missing") ||
    issues.includes("vitepress-quick-check-empty") ||
    issues.includes("slide-quality-d")
  ) {
    priority = "P1";
  } else if (issues.length > 0) {
    priority = "P2";
  }

  return {
    id: page.route,
    title: page.title,
    priority,
    issues,
    website: {
      file: page.file,
      route: page.route,
      hasDocumentSection: page.hasDocLink,
      hasSlideSection: page.hasSlideLink,
      hasQuizSection: page.hasQuizLink,
      quickCheck,
    },
    slide: {
      linkedPackage,
      discoveredPackage,
      package: slidePackage,
      packageExists: Boolean(slideAudit),
      href: page.slideHref,
      audit: slideAudit
        ? {
            score: slideAudit.score,
            grade: slideAudit.grade,
            slideCount: slideAudit.slideCount,
            dimensions: slideAudit.dimensions,
            signals: slideAudit.signals,
            riskFlags: slideAudit.riskFlags,
          }
        : null,
    },
    quiz: {
      href: page.quizHref,
      categoryParam: page.quizCategory,
      categoryParamDecoded: quizCategoryDecoded,
      matchedLeaf,
      files: quizFiles.map((file) => file.file),
      techKeys: quizFiles.map((file) => file.techKey),
      questionCount: quizFiles.reduce(
        (total, file) => total + file.questionCount,
        0,
      ),
      errorCount: quizErrorCount,
      warningCount: quizWarningCount,
    },
  };
});

nodes.sort((a, b) => a.website.file.localeCompare(b.website.file));
const usedSlidePackages = new Set(
  nodes.map((node) => node.slide.package).filter(Boolean),
);
const usedQuizFiles = new Set(nodes.flatMap((node) => node.quiz.files));
const priorities = Object.fromEntries(
  ["P0", "P1", "P2", "P3"].map((priority) => [
    priority,
    nodes.filter((node) => node.priority === priority).length,
  ]),
);
const slideGrades = Object.fromEntries(
  ["A", "B", "C", "D", "missing"].map((grade) => [
    grade,
    nodes.filter((node) => (node.slide.audit?.grade ?? "missing") === grade)
      .length,
  ]),
);
const generatedAt = new Date().toISOString();
const registry = {
  generatedAt,
  scope: "local-files-only",
  repositories: {
    quiz: readGitState(quizRoot),
    website: readGitState(websiteRoot),
    slideStack: readGitState(slideStackRoot),
  },
  summary: {
    nodes: nodes.length,
    priorities,
    slideGrades,
    mappedQuizNodes: nodes.filter((node) => node.quiz.matchedLeaf).length,
    mappedSlideNodes: nodes.filter((node) => node.slide.packageExists).length,
    displayedSlideLinks: nodes.filter((node) => node.slide.linkedPackage)
      .length,
  },
  website: {
    generatedAt: website.generatedAt,
    totals: website.totals,
  },
  slidev: {
    generatedAt: slidev.generatedAt,
    totals: slidev.totals,
    benchmark: slidev.benchmark,
    riskCounts: slidev.riskCounts,
  },
  quiz: {
    generatedAt: quiz.generatedAt,
    totals: quiz.totals,
    issueCounts: quiz.issueCounts,
  },
  orphans: {
    slidePackages: [...slidePackages]
      .filter((packageName) => !usedSlidePackages.has(packageName))
      .sort((a, b) => a.localeCompare(b)),
    quizFiles: quiz.files
      .map((file) => file.file)
      .filter((file) => !usedQuizFiles.has(file))
      .sort((a, b) => a.localeCompare(b)),
    vitepressContentPages: unassigned.map((page) => page.file),
  },
  nodes,
};

mkdirSync(outputRoot, { recursive: true });
const formattedRegistry = await format(JSON.stringify(registry), {
  parser: "json",
});
const formattedReport = await format(renderReport(registry), {
  parser: "markdown",
  proseWrap: "preserve",
});
writeFileSync(registryPath, formattedRegistry);
writeFileSync(reportPath, formattedReport);

console.log(
  [
    `技术节点: ${registry.summary.nodes}`,
    `Quiz 映射: ${registry.summary.mappedQuizNodes}/${registry.summary.nodes}`,
    `Slidev 映射: ${registry.summary.mappedSlideNodes}/${registry.summary.nodes}`,
    `优先级: ${Object.entries(priorities)
      .map(([priority, count]) => `${priority}=${count}`)
      .join(" ")}`,
    `已写入: ${path.relative(quizRoot, registryPath)}`,
    `已写入: ${path.relative(quizRoot, reportPath)}`,
  ].join("\n"),
);
