<template>
  <div class="quiz-page">
    <div v-if="loading">加载中…</div>
    <div v-else-if="question" class="card">
      <h2 class="stem">{{ question.stem }}</h2>
      <CheckRadioGroup
        v-model="selected"
        :options="question.options.map((o) => ({ value: o.id, label: o.text }))"
        :correct-value="status !== 'idle' ? correctOptionId : null"
        :disabled="status !== 'idle'"
      />

      <div v-if="status === 'wrong'" class="explanation">正确答案会高亮并显示解析</div>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="actions">
        <button @click="loadNext">下一题</button>
      </div>
    </div>
    <div v-else>暂无题目</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { CheckRadioGroup } from "@quiz/ui";
import { useQuiz } from "./composables/useQuiz";

const { question, loading, selected, status, loadNext, choose, error, correctOptionId } = useQuiz();

onMounted(() => loadNext());

watch(selected, (v, old) => {
  if (v != null && v !== old && status.value === "idle") {
    // submit answer when user selects an option
    choose(v as number);
  }
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
.explanation {
  margin-top: 12px;
  color: #374151;
}
.error {
  margin-top: 12px;
  color: #b91c1c;
  background: #fff1f2;
  padding: 8px;
  border-radius: 6px;
}
</style>
