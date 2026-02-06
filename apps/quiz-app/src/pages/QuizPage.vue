<template>
  <div class="quiz-page">
    <h1 class="page-title">Quiz</h1>

    <div v-if="loading">加载中…</div>
    <template v-else-if="question">
      <div class="card">
        <h2 class="stem">{{ question.stem }}</h2>
        <CheckRadioGroup
          v-model="selected"
          :options="radioOptions"
          :correct-value="status !== 'idle' ? correctOptionId : null"
        />

        <div v-if="error" class="error">{{ error }}</div>
      </div>

      <!-- 答错时显示"下一题"按钮，答对时自动跳转所以隐藏 - 放在卡片外面 -->
      <div v-if="status === 'wrong'" class="actions">
        <button @click="loadNext">下一题</button>
      </div>
    </template>
    <div v-else>暂无题目</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from "vue";
import { CheckRadioGroup } from "@quiz/ui";
import { useQuiz } from "./composables/useQuiz";

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
} = useQuiz();

onMounted(() => loadNext());

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
.quiz-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 24px;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;

  // 多彩渐变
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  // 不支持 background-clip: text 的浏览器回退
  @supports not (-webkit-background-clip: text) {
    color: var(--quiz-ui-primary);
    background: none;
  }
}

.card {
  width: 100%;
  max-width: 720px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  background-color: var(--quiz-ui-control-bg);
}

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;

  button {
    @apply px-6 py-3 rounded-lg font-medium cursor-pointer;
    background-color: var(--quiz-ui-primary);
    color: white;
    border: none;
    transition: all 0.3s ease;
    font-size: 1rem;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.error {
  margin-top: 12px;
  color: #b91c1c;
  background: #fff1f2;
  padding: 8px;
  border-radius: 6px;
}

/* 深色模式适配 */
.dark {
  .page-title {
    // 深色模式下使用更亮的渐变
    background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f9a8d4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}

/* 响应式：移动端 */
@media (max-width: 640px) {
  .quiz-page {
    padding: 16px;
  }

  .page-title {
    margin-bottom: 1.5rem;
  }

  .card {
    padding: 20px;
  }

  .actions button {
    @apply px-5 py-2.5;
    font-size: 0.9375rem;
  }
}
</style>
