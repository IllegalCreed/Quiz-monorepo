<template>
  <div class="quiz-page">
    <!-- 第一行：标题 -->
    <h1 class="page-title">Quiz</h1>

    <!-- 第二行：主内容区（卡片 + 按钮） -->
    <div class="quiz-content">
      <div v-if="loading">加载中…</div>
      <template v-else-if="question">
        <BaseCard>
          <BaseCardHeader divided>
            <h2 class="stem">{{ question.stem }}</h2>
            <!-- 分类标签（根据分类名自动分配颜色） -->
            <div v-if="question.categoryNames?.length" class="stem-tags">
              <BaseTag
                v-for="name in question.categoryNames"
                :key="name"
                size="sm"
                :color="getTagColor(name)"
              >
                {{ name }}
              </BaseTag>
            </div>
          </BaseCardHeader>
          <BaseCardContent>
            <CheckRadioGroup
              v-model="selected"
              :options="radioOptions"
              :correct-value="status !== 'idle' ? correctOptionId : null"
            />

            <!-- 答题失败时的错误提示（在卡片内显示） -->
            <div v-if="error" class="error">{{ error }}</div>

            <!-- 整体解析（答错后展示，仅当有内容时显示） -->
            <div v-if="status === 'wrong' && explanation" class="explanation">
              <span class="explanation__label">解析</span>
              {{ explanation }}
            </div>
          </BaseCardContent>
        </BaseCard>

        <!-- 答错时显示"下一题"按钮，答对时自动跳转所以隐藏 -->
        <div v-if="status === 'wrong'" class="actions">
          <BaseButton @click="loadNext">下一题</BaseButton>
        </div>

        <!-- 游客答错后登录引导弹窗 -->
        <LoginPrompt :status="status" />
      </template>
      <!-- 加载题目失败时的错误提示（在外层显示） -->
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>暂无题目</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed, ref } from "vue";
import {
  BaseCard,
  BaseCardHeader,
  BaseCardContent,
  BaseButton,
  BaseTag,
  getTagColor,
  CheckRadioGroup,
} from "@quiz/ui";
import { useQuiz } from "./composables/useQuiz";
import { useCategories } from "@/composables/useCategories";
import LoginPrompt from "@/components/LoginPrompt.vue";
import { useUserStore } from "@/stores/useUserStore";

const {
  question,
  loading,
  selected,
  status,
  loadNext,
  choose,
  error,
  correctOptionId,
  optionDescriptions,
  explanation,
} = useQuiz();

const { selectedIds, init: initCategories, loadUserPreferences } = useCategories();
const userStore = useUserStore();
const quizReady = ref(false);

onMounted(async () => {
  await initCategories();

  if (userStore.token) {
    await userStore.fetchUserInfo();
    if (userStore.isLoggedIn) {
      await loadUserPreferences();
    }
  }

  quizReady.value = true;
  await loadNext();
});

/** 分类变化时重新加载题目 */
watch(selectedIds, () => {
  if (!quizReady.value) return;
  loadNext();
});

watch(selected, (v, old) => {
  if (v != null && v !== old && status.value === "idle") {
    // submit answer when user selects an option
    choose(v as number);
  }
});

/**
 * 将题目选项映射为 CheckRadioGroup 需要的格式
 * 只在答错时显示 description（选项解析），答对不显示
 */
const radioOptions = computed(() => {
  if (!question.value) return [];
  return question.value.options.map((o) => ({
    value: o.id,
    label: o.text,
    description: status.value === "wrong" ? optionDescriptions.value[o.id] : undefined,
  }));
});
</script>

<style lang="scss" scoped>
/**
 * QuizPage 样式
 *
 * 采用 @apply + SCSS 风格（与 UI 库一致）
 * - CSS Grid 三行布局
 * - 标题带泛光效果
 * - 支持深色模式
 */

// ============================================
// 页面布局（Grid 两行）
// ============================================
.quiz-page {
  @apply flex-1 grid px-6 py-6 gap-8;
  // 两行：标题（1fr = 1/3） | 内容（2fr = 2/3）
  grid-template-rows: 1fr 2fr;
  grid-template-columns: 1fr;
}

// ============================================
// 标题样式（带泛光效果）
// ============================================
.page-title {
  @apply relative text-center font-bold m-0;
  font-size: clamp(2.5rem, 6vw, 4rem); // 增大字号（原 2-3rem）
  place-self: center; // Grid 中水平垂直居中
  z-index: 1;

  // 多彩渐变文字（浅色模式 - 更浅更亮）
  background: linear-gradient(135deg, #a5b4fc 0%, #d8b4fe 50%, #f9a8d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  // 椭圆形泛光背景（整体发光，不跟随文字轮廓）
  &::before {
    content: "";
    @apply absolute inset-0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 150%;
    background: radial-gradient(
      ellipse,
      rgba(167, 139, 250, 0.4) 0%,
      rgba(192, 132, 252, 0.25) 30%,
      rgba(244, 114, 182, 0.15) 60%,
      transparent 100%
    );
    filter: blur(40px);
    z-index: -1;
    pointer-events: none;
  }

  // 不支持 background-clip: text 的浏览器回退
  @supports not (-webkit-background-clip: text) {
    color: var(--quiz-ui-primary);
    background: none;
    &::before {
      display: none;
    }
  }
}

// ============================================
// 题目分类标签
// ============================================
.stem-tags {
  @apply flex flex-wrap gap-1.5 mt-2;
}

// ============================================
// 内容区域（第二行，顶对齐）
// ============================================
.quiz-content {
  @apply flex flex-col items-center gap-6;
  align-self: start; // Grid 中顶对齐
  width: 100%;
  max-width: 48rem; // 限制最大宽度（768px）
  justify-self: center; // Grid 中水平居中
}

// ============================================
// 题干样式（在 CardHeader 内使用）
// ============================================
.stem {
  @apply m-0 font-semibold leading-relaxed;
  font-size: 1.125rem; // 18px
  color: var(--quiz-ui-text);
}

// ============================================
// 操作按钮区域
// ============================================
.actions {
  @apply flex justify-center w-full mt-6;
}

// ============================================
// 整体解析样式
// ============================================
.explanation {
  @apply mt-4 px-4 py-3 rounded-lg text-sm leading-relaxed;
  color: var(--quiz-ui-text-secondary, #6b7280);
  background: var(--color-blue-50, #eff6ff);
  border-left: 3px solid var(--quiz-ui-primary, #6366f1);

  &__label {
    @apply font-semibold mr-2;
    color: var(--quiz-ui-primary, #6366f1);
  }
}

// ============================================
// 错误提示样式
// ============================================
.error {
  @apply mt-3 px-3 py-2 rounded-md text-sm;
  color: var(--quiz-ui-danger);
  background: var(--color-red-50);
}

// ============================================
// 深色模式适配
// ============================================
.dark {
  .page-title {
    // 深色模式渐变（更深的颜色，在深色背景上提供更强对比）
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    // 深色模式泛光更强（因为背景暗，需要更明显）
    &::before {
      background: radial-gradient(
        ellipse,
        rgba(167, 139, 250, 0.6) 0%,
        rgba(192, 132, 252, 0.4) 30%,
        rgba(244, 114, 182, 0.25) 60%,
        transparent 100%
      );
      filter: blur(50px);
    }
  }

  .explanation {
    background: var(--color-blue-950, #1e1b4b);
    color: var(--color-blue-200, #bfdbfe);
    border-left-color: var(--quiz-ui-primary, #818cf8);

    &__label {
      color: var(--color-indigo-400, #818cf8);
    }
  }

  .error {
    background: var(--color-red-900);
    color: var(--color-red-200);
  }
}

// ============================================
// 响应式：移动端优化
// ============================================
@media (max-width: 640px) {
  .quiz-page {
    @apply px-4 gap-4;
  }

  .page-title {
    font-size: clamp(2rem, 8vw, 3rem); // 移动端字号调整
  }

  .quiz-content {
    max-width: 100%; // 移动端占满宽度
  }
}
</style>
