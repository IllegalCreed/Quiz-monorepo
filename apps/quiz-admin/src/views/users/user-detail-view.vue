<script setup lang="ts">
/**
 * 用户详情页（只读）
 * 展示用户基本信息、做题历史、偏好分类
 */
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useMockStore } from "@/composables/use-mock-store";
import { useRouterStore } from "@/stores/modules/router";
import {
  getAppUser as getAppUserApi,
  getAppUserHistory as getAppUserHistoryApi,
  getAppUserPreferences as getAppUserPreferencesApi,
} from "@/api/users";
import {
  getAppUser as getAppUserMock,
  getAppUserHistory as getAppUserHistoryMock,
  getAppUserPreferences as getAppUserPreferencesMock,
} from "@/api/mock/users";
import type { AppUserDetail, AnswerAttemptItem, UserPreferenceItem } from "@/types/account";

defineOptions({ name: "UserDetailView" });

const route = useRoute();
const router = useRouter();
const { isMock } = useMockStore();
const routerStore = useRouterStore();

/** 用户 ID */
const userId = computed(() => Number(route.params.id));

/** 用户详情 */
const user = ref<AppUserDetail | null>(null);

/** 做题历史 */
const historyItems = ref<AnswerAttemptItem[]>([]);
const historyTotal = ref(0);
const historyPage = ref(1);
const historyPageSize = ref(20);

/** 偏好分类 */
const preferences = ref<UserPreferenceItem[]>([]);

/** 加载状态 */
const loading = ref(false);
const historyLoading = ref(false);

/** 当前 Tab */
const activeTab = ref("history");

/**
 * 按维度分组的偏好分类
 */
const groupedPreferences = computed(() => {
  const map = new Map<string, { groupName: string; categories: string[] }>();
  for (const pref of preferences.value) {
    const groupName = pref.category.group.name;
    if (!map.has(groupName)) {
      map.set(groupName, { groupName, categories: [] });
    }
    map.get(groupName)!.categories.push(pref.category.name);
  }
  return Array.from(map.values());
});

/**
 * 加载用户详情
 */
const loadUser = async () => {
  try {
    loading.value = true;
    user.value = isMock.value
      ? await getAppUserMock(userId.value)
      : await getAppUserApi(userId.value);

    // 更新 Tab 标题
    const name = user.value.nickname || user.value.username;
    routerStore.updateViewTitle(route.path, `用户：${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载用户详情失败";
    ElMessage.error(message);
    router.push("/home/users");
  } finally {
    loading.value = false;
  }
};

/**
 * 加载做题历史
 */
const loadHistory = async () => {
  try {
    historyLoading.value = true;
    const result = isMock.value
      ? await getAppUserHistoryMock(userId.value, historyPage.value, historyPageSize.value)
      : await getAppUserHistoryApi(userId.value, historyPage.value, historyPageSize.value);

    historyItems.value = result.items;
    historyTotal.value = result.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载做题历史失败";
    ElMessage.error(message);
  } finally {
    historyLoading.value = false;
  }
};

/**
 * 加载偏好分类
 */
const loadPreferences = async () => {
  try {
    preferences.value = isMock.value
      ? await getAppUserPreferencesMock(userId.value)
      : await getAppUserPreferencesApi(userId.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载偏好分类失败";
    ElMessage.error(message);
  }
};

/**
 * 做题历史分页切换
 */
const handleHistoryPageChange = (page: number) => {
  historyPage.value = page;
  loadHistory();
};

/**
 * 格式化日期时间
 */
const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString("zh-CN");
};

/**
 * 格式化耗时（毫秒 → 秒）
 */
const formatElapsed = (ms: number): string => {
  return `${(ms / 1000).toFixed(1)}s`;
};

onMounted(async () => {
  await loadUser();
  // 并行加载历史和偏好
  await Promise.all([loadHistory(), loadPreferences()]);
});
</script>

<template>
  <div v-loading="loading" class="user-detail">
    <!-- 面包屑导航 -->
    <div class="user-detail__breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home/users' }">用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <template v-if="user">
      <!-- 基本信息卡片 -->
      <el-card class="user-detail__card">
        <template #header>
          <span class="user-detail__card-title">基本信息</span>
        </template>

        <div class="user-detail__info">
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">ID</span>
            <span>{{ user.id }}</span>
          </div>
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">用户名</span>
            <span>{{ user.username }}</span>
          </div>
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">昵称</span>
            <span>{{ user.nickname || "-" }}</span>
          </div>
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">邮箱</span>
            <span>{{ user.email || "-" }}</span>
          </div>
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">状态</span>
            <el-tag :type="user.status === 'ACTIVE' ? 'success' : 'danger'" size="small">
              {{ user.status === "ACTIVE" ? "正常" : "禁用" }}
            </el-tag>
          </div>
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">做题次数</span>
            <span>{{ user._count.answerAttempts }}</span>
          </div>
          <div class="user-detail__info-row">
            <span class="user-detail__info-label">创建时间</span>
            <span>{{ formatDateTime(user.createdAt) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 做题历史 & 偏好分类 Tab -->
      <el-card class="user-detail__card">
        <el-tabs v-model="activeTab">
          <!-- 做题历史 -->
          <el-tab-pane label="做题历史" name="history">
            <el-table :data="historyItems" v-loading="historyLoading">
              <el-table-column label="题目" min-width="200">
                <template #default="{ row }">
                  <span class="user-detail__stem">{{ row.question.stem }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结果" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.correct ? 'success' : 'danger'" size="small">
                    {{ row.correct ? "正确" : "错误" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="耗时" width="80" align="center">
                <template #default="{ row }">
                  {{ formatElapsed(row.elapsedMs) }}
                </template>
              </el-table-column>
              <el-table-column label="答题时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.createdAt) }}
                </template>
              </el-table-column>

              <!-- 空状态：替换 el-table 默认的"暂无数据" -->
              <template #empty>
                <el-empty description="暂无做题记录" />
              </template>
            </el-table>

            <!-- 历史分页 -->
            <div v-if="historyTotal > 0" class="user-detail__pagination">
              <el-pagination
                v-model:current-page="historyPage"
                :page-size="historyPageSize"
                :total="historyTotal"
                layout="total, prev, pager, next"
                @current-change="handleHistoryPageChange"
              />
            </div>
          </el-tab-pane>

          <!-- 偏好分类 -->
          <el-tab-pane label="偏好分类" name="preferences">
            <div v-if="groupedPreferences.length > 0" class="user-detail__preferences">
              <div
                v-for="group in groupedPreferences"
                :key="group.groupName"
                class="user-detail__pref-group"
              >
                <span class="user-detail__pref-group-name">{{ group.groupName }}：</span>
                <el-tag
                  v-for="cat in group.categories"
                  :key="cat"
                  size="small"
                  class="user-detail__pref-tag"
                >
                  {{ cat }}
                </el-tag>
              </div>
            </div>

            <el-empty v-else description="暂无偏好分类" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.user-detail {
  @apply flex flex-col gap-4;

  &__breadcrumb {
    @apply mb-2;
  }

  &__card {
    @apply max-w-4xl;
  }

  &__card-title {
    @apply text-lg font-semibold;
    color: var(--el-text-color-primary);
  }

  &__info {
    @apply grid grid-cols-2 gap-x-8 gap-y-3;
  }

  &__info-row {
    @apply flex items-center gap-3;
  }

  &__info-label {
    @apply text-sm flex-shrink-0 w-20 text-right;
    color: var(--el-text-color-secondary);

    &::after {
      content: "：";
    }
  }

  &__stem {
    @apply text-sm line-clamp-1;
  }

  &__pagination {
    @apply flex justify-end pt-3;
  }

  &__preferences {
    @apply flex flex-col gap-3;
  }

  &__pref-group {
    @apply flex items-center gap-2;
  }

  &__pref-group-name {
    @apply text-sm flex-shrink-0;
    color: var(--el-text-color-secondary);
  }

  &__pref-tag {
    @apply mr-1;
  }
}

/* card 内嵌表格去掉全局阴影，改用简单边框 */
:deep(.el-card .el-table) {
  box-shadow: none;
  border: 1px solid var(--el-border-color-light);
}
</style>
