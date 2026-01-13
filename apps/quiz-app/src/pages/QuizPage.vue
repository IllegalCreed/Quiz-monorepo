<template>
  <div class="quiz-page">
    <div v-if="loading">加载中…</div>
    <div v-else-if="question" class="card">
      <h2 class="stem">{{ question.stem }}</h2>
      <ul class="options">
        <li v-for="opt in question.options" :key="opt.id">
          <button
            :class="['option', { selected: selected === opt.id, correct: status === 'correct' && selected === opt.id, wrong: status === 'wrong' && selected === opt.id } ]"
            @click="onChoose(opt.id)"
            :disabled="status !== 'idle'"
          >
            {{ opt.text }}
          </button>
        </li>
      </ul>

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
import { onMounted } from 'vue'
import { useQuiz } from './composables/useQuiz'

const { question, loading, selected, status, loadNext, choose, error } = useQuiz()

onMounted(() => loadNext())

function onChoose(optId: number) {
  choose(optId)
}
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.options { list-style: none; padding: 0; margin-top: 16px; }
.option { display:block; width:100%; padding: 12px; margin-bottom:8px; border-radius:6px; border:1px solid #eee; background:white; cursor:pointer; text-align:left }
.option.selected { outline: 2px solid #4f46e5; }
.option.correct { background: #dcfce7; border-color:#10b981 }
.option.wrong { background: #ffebee; border-color:#ef4444 }
.actions { margin-top:12px }
.explanation { margin-top:12px; color:#374151 }
.error { margin-top:12px; color:#b91c1c; background:#fff1f2; padding:8px; border-radius:6px }
</style>
