<script setup lang="ts">
/**
 * 题目管理列表页
 * 支持按关键词搜索、按标签筛选、分页浏览
 * 操作：新建（跳转详情页）、编辑（跳转详情页）、软删除
 */
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useMockStore } from "@/composables/use-mock-store";
import {
  getQuestions as getQuestionsMock,
  deleteQuestion as deleteQuestionMock,
} from "@/api/mock/questions";
import {
  getQuestions as getQuestionsApi,
  deleteQuestion as deleteQuestionApi,
} from "@/api/questions";
import type { QuestionItem } from "@/types/question";

/** 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive */
defineOptions({
  name: "QuestionsView",
});

const router = useRouter();
const { isMock } = useMockStore();

/** 题目列表数据 */
const questions = ref<QuestionItem[]>([]);

/** 加载状态 */
const loading = ref(false);

/** 总条数（分页） */
const total = ref(0);

/** 查询参数 */
const query = reactive({
  keyword: "",
  tag: "",
  page: 1,
  pageSize: 20,
});

/** 常用标签选项（用于筛选下拉） */
const tagOptions = ref<string[]>([
  "JavaScript",
  "Vue",
  "NestJS",
  "HTTP",
  "算法",
  "数据结构",
  "数据库",
  "网络",
  "安全",
  "基础",
]);

/**
 * 加载题目列表
 */
const loadQuestions = async () => {
  try {
    loading.value = true;
    const params = {
      keyword: query.keyword || undefined,
      tag: query.tag || undefined,
      page: query.page,
      pageSize: query.pageSize,
    };

    const result = isMock.value ? await getQuestionsMock(params) : await getQuestionsApi(params);
    questions.value = result.items;
    total.value = result.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载题目列表失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索/筛选（重置到第一页）
 */
const handleSearch = () => {
  query.page = 1;
  loadQuestions();
};

/**
 * 重置筛选条件
 */
const handleReset = () => {
  query.keyword = "";
  query.tag = "";
  query.page = 1;
  loadQuestions();
};

/**
 * 分页变化
 */
const handlePageChange = (page: number) => {
  query.page = page;
  loadQuestions();
};

/**
 * 跳转到新建题目页
 */
const handleCreate = () => {
  router.push("/home/questions/new");
};

/**
 * 跳转到编辑题目页
 */
const handleEdit = (id: number) => {
  router.push(`/home/questions/${id}`);
};

/**
 * 软删除题目
 */
const handleDelete = async (question: QuestionItem) => {
  try {
    await ElMessageBox.confirm(
      `确认删除题目「${question.stem.slice(0, 20)}...」？此操作不可恢复。`,
      "删除确认",
      {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    loading.value = true;
    if (isMock.value) {
      await deleteQuestionMock(question.id);
    } else {
      await deleteQuestionApi(question.id);
    }

    ElMessage.success("题目已删除");
    await loadQuestions();
  } catch (error) {
    // 用户取消（ElMessageBox.confirm 取消会 reject）
    if (error === "cancel") return;
    const message = error instanceof Error ? error.message : "删除失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 截断题干文字（列表展示用）
 */
const truncateStem = (stem: string, len = 60) => {
  return stem.length > len ? stem.slice(0, len) + "…" : stem;
};

/** 题目类型展示文字映射 */
const typeLabels: Record<string, string> = {
  single_choice: "单选题",
};

onMounted(() => {
  loadQuestions();
});
</script>

<template>
  <div class="questions-view">
    <!-- 页面头部 -->
    <div class="questions-view__header">
      <h2 class="questions-view__title">题目管理</h2>
      <el-button type="primary" @click="handleCreate">
        <template #icon>
          <i class="i-carbon-add" />
        </template>
        新增题目
      </el-button>
    </div>

    <!-- 搜索工具栏 -->
    <div class="questions-view__toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索题干关键词"
        clearable
        class="questions-view__search"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <i class="i-carbon-search" />
        </template>
      </el-input>

      <el-select
        v-model="query.tag"
        placeholder="按标签筛选"
        clearable
        class="questions-view__tag-select"
        @change="handleSearch"
        @clear="handleSearch"
      >
        <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
      </el-select>

      <el-button @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 题目表格 -->
    <el-table v-loading="loading" :data="questions" class="questions-view__table">
      <el-table-column prop="id" label="ID" width="70" align="center" />

      <el-table-column label="题干" min-width="280">
        <template #default="{ row }">
          <span :title="row.stem">{{ truncateStem(row.stem) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="题型" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="info">
            {{ typeLabels[row.type] ?? row.type }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="标签" width="180">
        <template #default="{ row }">
          <template v-if="row.tags && row.tags.length">
            <el-tag
              v-for="tag in row.tags.slice(0, 3)"
              :key="tag"
              size="small"
              class="questions-view__tag"
            >
              {{ tag }}
            </el-tag>
            <span v-if="row.tags.length > 3" class="questions-view__more-tags">
              +{{ row.tags.length - 3 }}
            </span>
          </template>
          <span v-else class="text-slate-400">-</span>
        </template>
      </el-table-column>

      <el-table-column label="选项数" width="80" align="center">
        <template #default="{ row }">
          {{ row._count?.options ?? "-" }}
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="160" align="center">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleDateString("zh-CN") }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" text @click="handleEdit(row.id)">编辑</el-button>
          <el-button size="small" type="danger" text @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="questions-view__pagination">
      <el-pagination
        v-model:current-page="query.page"
        :total="total"
        :page-size="query.pageSize"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.questions-view {
  @apply space-y-6;

  &__header {
    @apply flex items-center justify-between;
  }

  &__title {
    @apply text-2xl font-bold;
    color: var(--el-text-color-primary);
  }

  &__toolbar {
    @apply flex items-center gap-3 flex-wrap;
  }

  &__search {
    @apply w-64;
  }

  &__tag-select {
    @apply w-44;
  }

  &__table {
    @apply w-full;
  }

  &__tag {
    @apply mr-1;
  }

  &__more-tags {
    @apply text-xs text-slate-400;
  }

  &__pagination {
    @apply flex justify-end mt-2;
  }
}
</style>
