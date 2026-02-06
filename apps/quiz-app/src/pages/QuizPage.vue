<template>
  <div class="quiz-page">
    <div v-if="loading">加载中…</div>
    <div v-else-if="question" class="card">
      <h2 class="stem">{{ question.stem }}</h2>
      <CheckRadioGroup
        v-model="selected"
        :options="radioOptions"
        :correct-value="status !== 'idle' ? correctOptionId : null"
      />

      <div v-if="error" class="error">{{ error }}</div>

      <!-- 答错时显示"下一题"按钮，答对时自动跳转所以隐藏 -->
      <div v-if="status === 'wrong'" class="actions">
        <button @click="loadNext">下一题</button>
      </div>
    </div>
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
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}
.card {
  max-width: 720px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.actions {
  margin-top: 12px;
}
.error {
  margin-top: 12px;
  color: #b91c1c;
  background: #fff1f2;
  padding: 8px;
  border-radius: 6px;
}
</style>
