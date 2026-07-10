/**
 * 正式内容 JSON 的纯本地审计。
 *
 * 该脚本只读取 prisma/content，不连接数据库，也不会执行导入。
 * `--json` 用于三仓库统一登记表消费，默认输出便于人工阅读的摘要。
 */
import fs from "fs";
import path from "path";
import {
  CONTENT_CATEGORY_GROUPS,
  type CategoryNode,
} from "../prisma/content/categories";

type Severity = "error" | "warning";

interface ContentOption {
  text: string;
  isCorrect: boolean;
  description?: string;
}

interface ContentQuestion {
  stem: string;
  explanation?: string | null;
  tags?: string[] | null;
  categories?: [string, string][];
  options: ContentOption[];
}

interface CategoryLeaf {
  group: string;
  name: string;
  path: string[];
}

interface AuditIssue {
  code: string;
  severity: Severity;
  file: string;
  questionIndex?: number;
  message: string;
}

interface FileAudit {
  file: string;
  techKey: string;
  questionCount: number;
  technicalCategories: string[];
  difficulties: string[];
  errorCount: number;
  warningCount: number;
  issues: AuditIssue[];
}

interface ContentAuditResult {
  generatedAt: string;
  totals: {
    files: number;
    questions: number;
    categoryLeaves: number;
    technicalLeaves: number;
    difficultyLeaves: number;
    usedTechnicalLeaves: number;
    unusedTechnicalLeaves: number;
    errors: number;
    warnings: number;
    duplicateStems: number;
  };
  categoryLeaves: CategoryLeaf[];
  unusedTechnicalLeaves: string[];
  duplicateStems: Array<{ stem: string; occurrences: string[] }>;
  issueCounts: Record<string, number>;
  files: FileAudit[];
}

/** 判断未知值是否为普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 收集分类树的全部叶子，并保留完整路径。 */
function collectNodeLeaves(
  group: string,
  nodes: CategoryNode[],
  ancestors: string[] = [],
): CategoryLeaf[] {
  const leaves: CategoryLeaf[] = [];
  for (const node of nodes) {
    const currentPath = [...ancestors, node.name];
    if (node.children?.length) {
      leaves.push(...collectNodeLeaves(group, node.children, currentPath));
    } else {
      leaves.push({ group, name: node.name, path: currentPath });
    }
  }
  return leaves;
}

/** 生成分类名称匹配用的紧凑 key。 */
function compact(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^0-9a-zA-Z\u4e00-\u9fff]+/g, "")
    .toLowerCase();
}

/**
 * 保守检查题干是否在开头区域提到了技术名。
 * 该规则只产生 warning，后续仍需人工判断别名和章节型技术名。
 */
function hasTechnicalPrefix(
  stem: string,
  techKey: string,
  technicalCategories: string[],
): boolean {
  const head = compact(stem.slice(0, 100));
  const categoryPrefixes = technicalCategories.flatMap((name) => {
    const firstToken = name.split(/[（(/\s]/)[0] ?? name;
    return [name, firstToken];
  });
  const candidates = [techKey, ...categoryPrefixes]
    .map(compact)
    .filter((value) => value.length >= 2);
  return candidates.some((candidate) => head.includes(candidate));
}

/** 将未知值解析为导入脚本约定的题目结构。 */
function parseQuestion(value: unknown): ContentQuestion | null {
  if (!isRecord(value)) return null;
  if (typeof value.stem !== "string" || !Array.isArray(value.options)) {
    return null;
  }

  return value as unknown as ContentQuestion;
}

/** 执行纯本地内容审计。 */
function auditContent(): ContentAuditResult {
  const contentDir = path.join(__dirname, "../prisma/content");
  const categoryLeaves = CONTENT_CATEGORY_GROUPS.flatMap((group) =>
    collectNodeLeaves(group.name, group.categories),
  );
  const leafSets = new Map<string, Set<string>>();
  for (const leaf of categoryLeaves) {
    const current = leafSets.get(leaf.group) ?? new Set<string>();
    current.add(leaf.name);
    leafSets.set(leaf.group, current);
  }

  const jsonFiles = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));
  const files: FileAudit[] = [];
  const allIssues: AuditIssue[] = [];
  const stemOccurrences = new Map<string, string[]>();
  const usedTechnicalLeaves = new Set<string>();
  let totalQuestions = 0;

  for (const file of jsonFiles) {
    const techKey = path.basename(file, ".json");
    const issues: AuditIssue[] = [];
    const technicalCategories = new Set<string>();
    const difficulties = new Set<string>();
    let parsedContent: unknown;
    let rawQuestions: unknown[] = [];

    try {
      parsedContent = JSON.parse(
        fs.readFileSync(path.join(contentDir, file), "utf8"),
      );
    } catch (error) {
      issues.push({
        code: "invalid-json",
        severity: "error",
        file,
        message: error instanceof Error ? error.message : "JSON 解析失败",
      });
      parsedContent = [];
    }

    if (!Array.isArray(parsedContent)) {
      issues.push({
        code: "root-not-array",
        severity: "error",
        file,
        message: "题目文件根节点必须是数组",
      });
    } else {
      rawQuestions = parsedContent;
    }
    if (rawQuestions.length === 0) {
      issues.push({
        code: "empty-file",
        severity: "error",
        file,
        message: "题目文件为空",
      });
    }

    rawQuestions.forEach((rawQuestion, questionIndex) => {
      const question = parseQuestion(rawQuestion);
      if (!question) {
        issues.push({
          code: "invalid-question-shape",
          severity: "error",
          file,
          questionIndex,
          message: "题目缺少 stem 或 options 数组",
        });
        return;
      }

      totalQuestions += 1;
      const stem = question.stem.trim();
      if (stem === "") {
        issues.push({
          code: "empty-stem",
          severity: "error",
          file,
          questionIndex,
          message: "题干为空",
        });
      } else {
        const occurrences = stemOccurrences.get(stem) ?? [];
        occurrences.push(`${file}#${questionIndex + 1}`);
        stemOccurrences.set(stem, occurrences);
      }

      if (!question.explanation?.trim()) {
        issues.push({
          code: "missing-explanation",
          severity: "error",
          file,
          questionIndex,
          message: "缺少题目解析",
        });
      } else if (question.explanation.trim().length < 30) {
        issues.push({
          code: "short-explanation",
          severity: "warning",
          file,
          questionIndex,
          message: "题目解析少于 30 字，需人工检查信息量",
        });
      }

      if (!Array.isArray(question.tags) || question.tags.length === 0) {
        issues.push({
          code: "missing-tags",
          severity: "warning",
          file,
          questionIndex,
          message: "缺少 tags",
        });
      }

      const questionTechnicalCategories: string[] = [];
      const questionDifficulties: string[] = [];
      if (!Array.isArray(question.categories)) {
        issues.push({
          code: "missing-categories",
          severity: "error",
          file,
          questionIndex,
          message: "缺少 categories",
        });
      } else {
        for (const category of question.categories) {
          if (
            !Array.isArray(category) ||
            category.length !== 2 ||
            typeof category[0] !== "string" ||
            typeof category[1] !== "string"
          ) {
            issues.push({
              code: "invalid-category-pair",
              severity: "error",
              file,
              questionIndex,
              message: "分类必须使用 [维度名, 叶子名]",
            });
            continue;
          }
          const [group, leaf] = category;
          if (!leafSets.get(group)?.has(leaf)) {
            issues.push({
              code: "unknown-category-leaf",
              severity: "error",
              file,
              questionIndex,
              message: `分类不存在或不是叶子：${group} / ${leaf}`,
            });
          }
          if (group === "技术方向") {
            questionTechnicalCategories.push(leaf);
            technicalCategories.add(leaf);
            usedTechnicalLeaves.add(leaf);
          }
          if (group === "难度") {
            questionDifficulties.push(leaf);
            difficulties.add(leaf);
          }
        }
      }

      if (questionTechnicalCategories.length !== 1) {
        issues.push({
          code: "technical-category-count",
          severity: "error",
          file,
          questionIndex,
          message: `技术方向分类数量应为 1，实际为 ${questionTechnicalCategories.length}`,
        });
      }
      if (questionDifficulties.length !== 1) {
        issues.push({
          code: "difficulty-category-count",
          severity: "error",
          file,
          questionIndex,
          message: `难度分类数量应为 1，实际为 ${questionDifficulties.length}`,
        });
      }
      if (
        stem !== "" &&
        !hasTechnicalPrefix(stem, techKey, questionTechnicalCategories)
      ) {
        issues.push({
          code: "missing-technical-prefix",
          severity: "warning",
          file,
          questionIndex,
          message: "题干开头区域未识别到技术名，需人工确认",
        });
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        issues.push({
          code: "insufficient-options",
          severity: "error",
          file,
          questionIndex,
          message: "选项数量少于 2",
        });
      } else {
        const optionTexts = new Set<string>();
        let correctCount = 0;
        question.options.forEach((option, optionIndex) => {
          if (!isRecord(option) || typeof option.text !== "string") {
            issues.push({
              code: "invalid-option-shape",
              severity: "error",
              file,
              questionIndex,
              message: `第 ${optionIndex + 1} 个选项结构无效`,
            });
            return;
          }
          const optionText = option.text.trim();
          if (optionText === "") {
            issues.push({
              code: "empty-option",
              severity: "error",
              file,
              questionIndex,
              message: `第 ${optionIndex + 1} 个选项为空`,
            });
          }
          if (optionTexts.has(optionText)) {
            issues.push({
              code: "duplicate-option",
              severity: "error",
              file,
              questionIndex,
              message: `重复选项：${optionText}`,
            });
          }
          optionTexts.add(optionText);
          if (option.isCorrect === true) correctCount += 1;
          if (typeof option.isCorrect !== "boolean") {
            issues.push({
              code: "invalid-correct-flag",
              severity: "error",
              file,
              questionIndex,
              message: `第 ${optionIndex + 1} 个选项缺少布尔 isCorrect`,
            });
          }
          if (
            typeof option.description !== "string" ||
            option.description.trim() === ""
          ) {
            issues.push({
              code: "missing-option-description",
              severity: "error",
              file,
              questionIndex,
              message: `第 ${optionIndex + 1} 个选项缺少解析`,
            });
          }
        });
        if (correctCount !== 1) {
          issues.push({
            code: "correct-option-count",
            severity: "error",
            file,
            questionIndex,
            message: `正确选项数量应为 1，实际为 ${correctCount}`,
          });
        }
      }
    });

    const fileAudit: FileAudit = {
      file,
      techKey,
      questionCount: rawQuestions.length,
      technicalCategories: [...technicalCategories].sort((a, b) =>
        a.localeCompare(b),
      ),
      difficulties: [...difficulties].sort((a, b) => a.localeCompare(b)),
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning")
        .length,
      issues,
    };
    files.push(fileAudit);
    allIssues.push(...issues);
  }

  const duplicateStems = [...stemOccurrences.entries()]
    .filter(([, occurrences]) => occurrences.length > 1)
    .map(([stem, occurrences]) => ({ stem, occurrences }))
    .sort((a, b) => a.stem.localeCompare(b.stem));
  for (const duplicate of duplicateStems) {
    allIssues.push({
      code: "duplicate-stem",
      severity: "error",
      file: duplicate.occurrences[0]?.split("#")[0] ?? "unknown",
      message: `题干重复 ${duplicate.occurrences.length} 次：${duplicate.stem}`,
    });
  }

  const issueCounts: Record<string, number> = {};
  for (const issue of allIssues) {
    issueCounts[issue.code] = (issueCounts[issue.code] ?? 0) + 1;
  }
  const technicalLeaves = categoryLeaves.filter(
    (leaf) => leaf.group === "技术方向",
  );
  const difficultyLeaves = categoryLeaves.filter(
    (leaf) => leaf.group === "难度",
  );
  const unusedTechnicalLeaves = technicalLeaves
    .map((leaf) => leaf.name)
    .filter((name) => !usedTechnicalLeaves.has(name))
    .sort((a, b) => a.localeCompare(b));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      files: files.length,
      questions: totalQuestions,
      categoryLeaves: categoryLeaves.length,
      technicalLeaves: technicalLeaves.length,
      difficultyLeaves: difficultyLeaves.length,
      usedTechnicalLeaves: usedTechnicalLeaves.size,
      unusedTechnicalLeaves: unusedTechnicalLeaves.length,
      errors: allIssues.filter((issue) => issue.severity === "error").length,
      warnings: allIssues.filter((issue) => issue.severity === "warning")
        .length,
      duplicateStems: duplicateStems.length,
    },
    categoryLeaves,
    unusedTechnicalLeaves,
    duplicateStems,
    issueCounts,
    files,
  };
}

const result = auditContent();
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    [
      `Content JSON: ${result.totals.files}`,
      `Questions: ${result.totals.questions}`,
      `Technical leaves used/total: ${result.totals.usedTechnicalLeaves}/${result.totals.technicalLeaves}`,
      `Errors/warnings: ${result.totals.errors}/${result.totals.warnings}`,
      `Duplicate stems: ${result.totals.duplicateStems}`,
    ].join("\n"),
  );
}
