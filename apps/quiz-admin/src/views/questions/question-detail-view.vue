<script setup lang="ts">
/**
 * 题目详情页（新建 + 编辑复用）
 * 路由参数 :id = "new" 时为新建，数字时为编辑
 *
 * 功能：
 * - 题干、题型、标签、解析等基本信息编辑
 * - 动态选项管理（添加/删除/标记正确答案）
 * - 单选题约束：恰好 1 个正确答案
 * - 提交后返回列表页
 */
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useMockStore } from "@/composables/use-mock-store";
import {
  getQuestion as getQuestionMock,
  createQuestion as createQuestionMock,
  updateQuestion as updateQuestionMock,
} from "@/api/mock/questions";
import {
  getQuestion as getQuestionApi,
  createQuestion as createQuestionApi,
  updateQuestion as updateQuestionApi,
} from "@/api/questions";
import type { OptionForm, QuestionForm } from "@/types/question";

defineOptions({ name: "QuestionDetailView" });

const route = useRoute();
const router = useRouter();
const { isMock } = useMockStore();

/** 是否为新建模式 */
const isCreate = computed(() => route.params.id === "new");

/** 当前题目 ID（编辑模式） */
const questionId = computed(() => {
  const id = route.params.id as string;
  return id === "new" ? null : Number(id);
});

/** 页面标题 */
const pageTitle = computed(() => (isCreate.value ? "新增题目" : `编辑题目 #${questionId.value}`));

/** 提交中状态 */
const submitting = ref(false);

/** 初始加载状态 */
const loading = ref(false);

/** 表单数据 */
const form = ref<QuestionForm>({
  stem: "",
  type: "single_choice",
  explanation: "",
  tags: [],
  options: [
    { text: "", isCorrect: true, description: "" },
    { text: "", isCorrect: false, description: "" },
  ],
});

/** 当前正确答案的索引（用于 Radio Group 单选交互） */
const correctIndex = ref(0);

/** 题目类型选项（预留扩展） */
const typeOptions = [{ value: "single_choice", label: "单选题" }];

/** 常用标签（标签选择器候选值） */
const tagCandidates = [
  "JavaScript",
  "TypeScript",
  "Vue",
  "React",
  "NestJS",
  "HTTP",
  "算法",
  "数据结构",
  "数据库",
  "网络",
  "安全",
  "基础",
];

/**
 * 设置正确答案
 * 选中某个选项时，清除其他选项的 isCorrect，确保单选题约束
 */
const setCorrectAnswer = (index: number) => {
  correctIndex.value = index;
  form.value.options.forEach((opt, i) => {
    opt.isCorrect = i === index;
  });
};

/**
 * 添加选项
 */
const addOption = () => {
  form.value.options.push({ text: "", isCorrect: false, description: "" });
};

/**
 * 删除选项
 */
const removeOption = (index: number) => {
  if (form.value.options.length <= 2) {
    ElMessage.warning("至少需要 2 个选项");
    return;
  }

  form.value.options.splice(index, 1);

  // 如果删除的是当前正确答案，将第一个设为正确
  if (correctIndex.value >= form.value.options.length) {
    setCorrectAnswer(0);
  }
};

/**
 * 表单验证
 */
const validateForm = (): boolean => {
  if (!form.value.stem.trim()) {
    ElMessage.warning("请输入题干");
    return false;
  }

  if (form.value.options.length < 2) {
    ElMessage.warning("至少需要 2 个选项");
    return false;
  }

  for (const [i, opt] of form.value.options.entries()) {
    if (!opt.text.trim()) {
      ElMessage.warning(`请输入第 ${i + 1} 个选项的文本`);
      return false;
    }
  }

  const correctCount = form.value.options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) {
    ElMessage.warning("请选择一个正确答案");
    return false;
  }

  return true;
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    submitting.value = true;

    // 整理提交数据（去掉首尾空白）
    const submitData: QuestionForm = {
      stem: form.value.stem.trim(),
      type: form.value.type,
      explanation: form.value.explanation.trim(),
      tags: form.value.tags.filter((t) => t.trim()),
      options: form.value.options.map((o) => ({
        text: o.text.trim(),
        isCorrect: o.isCorrect,
        description: o.description.trim(),
      })),
    };

    if (isCreate.value) {
      // 新建题目
      if (isMock.value) {
        await createQuestionMock(submitData);
      } else {
        await createQuestionApi(submitData);
      }
      ElMessage.success("题目创建成功");
    } else {
      // 编辑题目
      if (isMock.value) {
        await updateQuestionMock(questionId.value!, submitData);
      } else {
        await updateQuestionApi(questionId.value!, submitData);
      }
      ElMessage.success("题目保存成功");
    }

    // 返回列表页
    router.push("/home/questions");
  } catch (error) {
    const message = error instanceof Error ? error.message : "操作失败";
    ElMessage.error(message);
  } finally {
    submitting.value = false;
  }
};

/**
 * 取消并返回列表
 */
const handleCancel = async () => {
  // 简单检查是否有修改（题干非空则提示确认）
  if (form.value.stem.trim()) {
    try {
      await ElMessageBox.confirm("确认放弃当前修改并返回列表？", "提示", {
        confirmButtonText: "放弃修改",
        cancelButtonText: "继续编辑",
        type: "warning",
      });
    } catch {
      return; // 用户取消，留在当前页
    }
  }
  router.push("/home/questions");
};

/**
 * 加载题目数据（编辑模式）
 */
const loadQuestion = async () => {
  if (isCreate.value || !questionId.value) return;

  try {
    loading.value = true;
    const question = isMock.value
      ? await getQuestionMock(questionId.value)
      : await getQuestionApi(questionId.value);

    // 填充表单
    form.value = {
      stem: question.stem,
      type: question.type,
      explanation: question.explanation ?? "",
      tags: question.tags ?? [],
      options: question.options.map(
        (o): OptionForm => ({
          text: o.text,
          isCorrect: o.isCorrect,
          description: o.description ?? "",
        }),
      ),
    };

    // 同步正确答案索引
    const idx = form.value.options.findIndex((o) => o.isCorrect);
    correctIndex.value = idx >= 0 ? idx : 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载题目失败";
    ElMessage.error(message);
    router.push("/home/questions");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadQuestion();
});
</script>

<template>
  <div v-loading="loading" class="question-detail-view">
    <!-- 面包屑导航 -->
    <div class="question-detail-view__breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home/questions' }">题目管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 表单卡片 -->
    <el-card class="question-detail-view__card" shadow="never">
      <template #header>
        <div class="question-detail-view__card-header">
          <span class="question-detail-view__card-title">{{ pageTitle }}</span>
        </div>
      </template>

      <div class="question-detail-view__form">
        <!-- 基本信息区域 -->
        <div class="question-detail-view__section">
          <h3 class="question-detail-view__section-title">基本信息</h3>

          <!-- 题干 -->
          <div class="question-detail-view__field">
            <label class="question-detail-view__label question-detail-view__label--required">
              题干
            </label>
            <el-input
              v-model="form.stem"
              type="textarea"
              :rows="3"
              placeholder="请输入题目题干"
              maxlength="1000"
              show-word-limit
            />
          </div>

          <!-- 题型 -->
          <div class="question-detail-view__field">
            <label class="question-detail-view__label">题型</label>
            <el-select v-model="form.type" class="question-detail-view__type-select">
              <el-option
                v-for="opt in typeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>

          <!-- 标签 -->
          <div class="question-detail-view__field">
            <label class="question-detail-view__label">标签</label>
            <el-select
              v-model="form.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入标签（回车创建新标签）"
              class="question-detail-view__tags-select"
            >
              <el-option v-for="tag in tagCandidates" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </div>

          <!-- 整体解析 -->
          <div class="question-detail-view__field">
            <label class="question-detail-view__label">整体解析</label>
            <el-input
              v-model="form.explanation"
              type="textarea"
              :rows="2"
              placeholder="可选。题目整体解析，答题后展示给用户"
            />
          </div>
        </div>

        <!-- 选项管理区域 -->
        <div class="question-detail-view__section">
          <div class="question-detail-view__section-header">
            <h3 class="question-detail-view__section-title">选项管理</h3>
            <span class="question-detail-view__section-tip">
              点击"正确答案"单选按钮标记正确选项
            </span>
          </div>

          <!-- 选项列表 -->
          <div class="question-detail-view__options">
            <div
              v-for="(option, index) in form.options"
              :key="index"
              class="question-detail-view__option"
              :class="{ 'question-detail-view__option--correct': option.isCorrect }"
            >
              <!-- 选项序号 + 正确答案 Radio -->
              <div class="question-detail-view__option-header">
                <el-radio
                  :model-value="correctIndex"
                  :value="index"
                  @change="setCorrectAnswer(index)"
                >
                  <span class="question-detail-view__option-label">
                    选项 {{ String.fromCharCode(65 + index) }}
                  </span>
                </el-radio>

                <el-tag v-if="option.isCorrect" type="success" size="small" class="ml-2">
                  正确答案
                </el-tag>

                <el-button
                  v-if="form.options.length > 2"
                  size="small"
                  type="danger"
                  text
                  class="question-detail-view__option-remove"
                  @click="removeOption(index)"
                >
                  <i class="i-carbon-trash-can" />
                </el-button>
              </div>

              <!-- 选项文本 -->
              <el-input
                v-model="option.text"
                placeholder="选项文本（必填）"
                class="question-detail-view__option-text"
              />

              <!-- 选项解析 -->
              <el-input
                v-model="option.description"
                type="textarea"
                :rows="2"
                placeholder="选项解析（可选，答题后展示说明为什么对/错）"
                class="question-detail-view__option-desc"
              />
            </div>
          </div>

          <!-- 添加选项按钮 -->
          <el-button class="question-detail-view__add-option" dashed @click="addOption">
            <template #icon>
              <i class="i-carbon-add" />
            </template>
            添加选项
          </el-button>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="question-detail-view__footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isCreate ? "创建题目" : "保存修改" }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.question-detail-view {
  @apply flex flex-col gap-4;

  &__breadcrumb {
    @apply mb-2;
  }

  &__card {
    @apply max-w-3xl;
  }

  &__card-header {
    @apply flex items-center;
  }

  &__card-title {
    @apply text-xl font-semibold;
    color: var(--el-text-color-primary);
  }

  &__form {
    @apply flex flex-col gap-6;
  }

  &__section {
    @apply flex flex-col gap-4;
  }

  &__section-header {
    @apply flex items-center justify-between;
  }

  &__section-title {
    @apply text-base font-medium;
    color: var(--el-text-color-primary);
  }

  &__section-tip {
    @apply text-sm;
    color: var(--el-text-color-secondary);
  }

  &__field {
    @apply flex flex-col gap-1.5;
  }

  &__label {
    @apply text-sm font-medium;
    color: var(--el-text-color-regular);

    &--required::before {
      content: "* ";
      color: var(--el-color-danger);
    }
  }

  &__type-select {
    @apply w-40;
  }

  &__tags-select {
    @apply w-full;
  }

  &__options {
    @apply flex flex-col gap-3;
  }

  &__option {
    @apply flex flex-col gap-2 p-4 rounded-lg border border-solid transition-colors;
    border-color: var(--el-border-color);

    &--correct {
      border-color: var(--el-color-success);
      background-color: var(--el-color-success-light-9);
    }
  }

  &__option-header {
    @apply flex items-center;
  }

  &__option-label {
    @apply font-medium;
  }

  &__option-remove {
    @apply ml-auto;
  }

  &__option-text {
    @apply w-full;
  }

  &__option-desc {
    @apply w-full;
  }

  &__add-option {
    @apply w-full mt-1;
  }

  &__footer {
    @apply flex justify-end gap-3 pt-4 mt-4 border-t border-solid;
    border-color: var(--el-border-color-lighter);
  }
}
</style>
