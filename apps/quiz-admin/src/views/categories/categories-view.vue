<script setup lang="ts">
/**
 * 分类管理页
 *
 * 布局：左侧维度列表 + 右侧当前维度的分类树
 * - 维度支持新建、编辑、删除
 * - 分类树支持新建根节点、新建子节点、编辑、删除
 */
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useEventBus } from "@vueuse/core";
import { useMockStore } from "@/composables/use-mock-store";
import type { CategoryGroupItem, CategoryItem } from "@/types/category";
import CategoryTreeNode from "./category-tree-node.vue";

import * as realApi from "@/api/categories";
import * as mockApi from "@/api/mock/categories";

defineOptions({ name: "CategoriesView" });

const { isMock } = useMockStore();
const api = computed(() => (isMock.value ? mockApi : realApi));

// ── 数据 ──────────────────────────────────
const groups = ref<CategoryGroupItem[]>([]);
const loading = ref(false);
/** 当前选中的维度 ID */
const selectedGroupId = ref<number | null>(null);
/** 当前选中的维度对象 */
const selectedGroup = computed(
  () => groups.value.find((g) => g.id === selectedGroupId.value) ?? null,
);

// ── 维度编辑状态 ──────────────────────────
/** 正在内联编辑的维度 ID（null = 非编辑状态） */
const editingGroupId = ref<number | null>(null);
const editingGroupName = ref("");
/** 新增维度输入框是否显示 */
const showNewGroup = ref(false);
const newGroupName = ref("");

// ── 分类节点编辑状态 ──────────────────────
/** 正在内联编辑的分类节点 ID */
const editingCategoryId = ref<number | null>(null);
const editingCategoryName = ref("");
/** 新增子节点弹出状态：key = 父节点 ID（-1 表示根节点） */
const addingChildOfId = ref<number | null>(null);
const newCategoryName = ref("");

// ── 事件总线（其他页面触发刷新） ──────────
const bus = useEventBus<void>("categories-refresh");
bus.on(() => loadGroups());

// ── 初始化 ────────────────────────────────
onMounted(() => loadGroups());

async function loadGroups() {
  loading.value = true;
  try {
    groups.value = await api.value.getCategoryGroups();
    // 默认选中第一个维度
    if (!selectedGroupId.value && groups.value.length > 0) {
      selectedGroupId.value = groups.value[0]!.id;
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "加载分类数据失败");
  } finally {
    loading.value = false;
  }
}

// ── 维度操作 ──────────────────────────────

/** 开始新增维度 */
function startNewGroup() {
  newGroupName.value = "";
  showNewGroup.value = true;
}

/** 确认新增维度 */
async function confirmNewGroup() {
  if (!newGroupName.value.trim()) {
    ElMessage.warning("维度名称不能为空");
    return;
  }
  try {
    await api.value.createCategoryGroup({ name: newGroupName.value.trim() });
    showNewGroup.value = false;
    newGroupName.value = "";
    await loadGroups();
    ElMessage.success("维度创建成功");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "创建失败");
  }
}

/** 取消新增维度 */
function cancelNewGroup() {
  showNewGroup.value = false;
  newGroupName.value = "";
}

/** 开始编辑维度名称 */
function startEditGroup(group: CategoryGroupItem) {
  editingGroupId.value = group.id;
  editingGroupName.value = group.name;
}

/** 确认编辑维度名称 */
async function confirmEditGroup(groupId: number) {
  if (!editingGroupName.value.trim()) {
    ElMessage.warning("维度名称不能为空");
    return;
  }
  try {
    await api.value.updateCategoryGroup(groupId, { name: editingGroupName.value.trim() });
    editingGroupId.value = null;
    await loadGroups();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "保存失败");
  }
}

/** 取消编辑维度 */
function cancelEditGroup() {
  editingGroupId.value = null;
}

/** 删除维度 */
async function handleDeleteGroup(group: CategoryGroupItem) {
  try {
    await ElMessageBox.confirm(
      `确认删除维度「${group.name}」？该维度下不能有任何分类节点。`,
      "删除确认",
      { confirmButtonText: "确认删除", cancelButtonText: "取消", type: "warning" },
    );
    await api.value.deleteCategoryGroup(group.id);
    if (selectedGroupId.value === group.id) selectedGroupId.value = null;
    await loadGroups();
    if (!selectedGroupId.value && groups.value.length > 0) {
      selectedGroupId.value = groups.value[0]!.id;
    }
    ElMessage.success("维度已删除");
  } catch (e) {
    if (e === "cancel") return;
    ElMessage.error(e instanceof Error ? e.message : "删除失败");
  }
}

// ── 分类节点操作 ──────────────────────────

/** 开始在 parentId 下新增分类（parentId = -1 表示根节点） */
function startAddCategory(parentId: number) {
  addingChildOfId.value = parentId;
  newCategoryName.value = "";
}

/** 确认新增分类节点 */
async function confirmAddCategory() {
  if (!selectedGroupId.value) return;
  if (!newCategoryName.value.trim()) {
    ElMessage.warning("分类名称不能为空");
    return;
  }
  const parentId = addingChildOfId.value === -1 ? null : addingChildOfId.value;
  try {
    await api.value.createCategory(selectedGroupId.value, {
      name: newCategoryName.value.trim(),
      groupId: selectedGroupId.value,
      parentId,
    });
    addingChildOfId.value = null;
    newCategoryName.value = "";
    await loadGroups();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "创建失败");
  }
}

/** 取消新增分类 */
function cancelAddCategory() {
  addingChildOfId.value = null;
  newCategoryName.value = "";
}

/** 开始编辑分类节点 */
function startEditCategory(node: CategoryItem) {
  editingCategoryId.value = node.id;
  editingCategoryName.value = node.name;
}

/** 确认编辑分类节点 */
async function confirmEditCategory(nodeId: number) {
  if (!editingCategoryName.value.trim()) {
    ElMessage.warning("分类名称不能为空");
    return;
  }
  try {
    await api.value.updateCategory(nodeId, { name: editingCategoryName.value.trim() });
    editingCategoryId.value = null;
    await loadGroups();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "保存失败");
  }
}

/** 取消编辑分类节点 */
function cancelEditCategory() {
  editingCategoryId.value = null;
}

/** 删除分类节点 */
async function handleDeleteCategory(node: CategoryItem) {
  try {
    await ElMessageBox.confirm(
      `确认删除分类「${node.name}」？该节点下不能有子分类，且不能已关联题目。`,
      "删除确认",
      { confirmButtonText: "确认删除", cancelButtonText: "取消", type: "warning" },
    );
    await api.value.deleteCategory(node.id);
    await loadGroups();
    ElMessage.success("分类已删除");
  } catch (e) {
    if (e === "cancel") return;
    ElMessage.error(e instanceof Error ? e.message : "删除失败");
  }
}
</script>

<template>
  <div class="categories-view" v-loading="loading">
    <!-- 页头 -->
    <div class="categories-view__header">
      <h2 class="categories-view__title">分类管理</h2>
      <p class="categories-view__subtitle">管理题目的多维度结构化分类体系（维度 + 树形分类节点）</p>
    </div>

    <div class="categories-view__body">
      <!-- ── 左侧：维度列表 ── -->
      <div class="categories-view__sidebar">
        <div class="categories-view__sidebar-header">
          <span class="categories-view__sidebar-title">分类维度</span>
          <el-button size="small" type="primary" text @click="startNewGroup">
            <template #icon><i class="i-carbon-add" /></template>
            新增维度
          </el-button>
        </div>

        <!-- 维度列表 -->
        <div class="categories-view__group-list">
          <!-- 新增维度输入行 -->
          <div v-if="showNewGroup" class="categories-view__group-input-row">
            <el-input
              v-model="newGroupName"
              size="small"
              placeholder="输入维度名称"
              autofocus
              @keyup.enter="confirmNewGroup"
              @keyup.esc="cancelNewGroup"
            />
            <el-button size="small" type="primary" @click="confirmNewGroup">确认</el-button>
            <el-button size="small" @click="cancelNewGroup">取消</el-button>
          </div>

          <!-- 维度列表项 -->
          <div
            v-for="group in groups"
            :key="group.id"
            class="categories-view__group-item"
            :class="{ 'is-active': selectedGroupId === group.id }"
            @click="selectedGroupId = group.id"
          >
            <!-- 编辑状态 -->
            <template v-if="editingGroupId === group.id">
              <el-input
                v-model="editingGroupName"
                size="small"
                autofocus
                @keyup.enter="confirmEditGroup(group.id)"
                @keyup.esc="cancelEditGroup"
                @click.stop
              />
              <el-button size="small" type="primary" text @click.stop="confirmEditGroup(group.id)">
                <i class="i-carbon-checkmark" />
              </el-button>
              <el-button size="small" text @click.stop="cancelEditGroup">
                <i class="i-carbon-close" />
              </el-button>
            </template>

            <!-- 普通状态 -->
            <template v-else>
              <div class="categories-view__group-label">
                <span class="categories-view__group-name">{{ group.name }}</span>
                <span class="categories-view__group-count">
                  {{ group.categories.length }}
                </span>
              </div>
              <div class="categories-view__group-actions">
                <el-button size="small" text @click.stop="startEditGroup(group)">
                  <i class="i-carbon-edit" />
                </el-button>
                <el-button size="small" text type="danger" @click.stop="handleDeleteGroup(group)">
                  <i class="i-carbon-trash-can" />
                </el-button>
              </div>
            </template>
          </div>

          <div v-if="groups.length === 0 && !showNewGroup" class="categories-view__empty-groups">
            暂无维度，点击「新增维度」开始
          </div>
        </div>
      </div>

      <!-- ── 右侧：分类树 ── -->
      <div class="categories-view__content">
        <template v-if="selectedGroup">
          <div class="categories-view__tree-header">
            <span class="categories-view__tree-title">「{{ selectedGroup.name }}」分类树</span>
            <el-button size="small" type="primary" text @click="startAddCategory(-1)">
              <template #icon><i class="i-carbon-add" /></template>
              新增根分类
            </el-button>
          </div>

          <!-- 新增根分类输入行 -->
          <div v-if="addingChildOfId === -1" class="categories-view__add-row">
            <el-input
              v-model="newCategoryName"
              size="small"
              placeholder="输入根分类名称"
              autofocus
              @keyup.enter="confirmAddCategory"
              @keyup.esc="cancelAddCategory"
            />
            <el-button size="small" type="primary" @click="confirmAddCategory">确认</el-button>
            <el-button size="small" @click="cancelAddCategory">取消</el-button>
          </div>

          <!-- 分类树（递归渲染） -->
          <div class="categories-view__tree">
            <CategoryTreeNode
              v-for="node in selectedGroup.categories"
              :key="node.id"
              :node="node"
              :depth="0"
              :editing-id="editingCategoryId"
              :editing-name="editingCategoryName"
              :adding-child-of-id="addingChildOfId"
              :new-category-name="newCategoryName"
              @update:editing-name="editingCategoryName = $event"
              @update:new-category-name="newCategoryName = $event"
              @start-edit="startEditCategory"
              @confirm-edit="confirmEditCategory"
              @cancel-edit="cancelEditCategory"
              @start-add-child="startAddCategory"
              @confirm-add="confirmAddCategory"
              @cancel-add="cancelAddCategory"
              @delete="handleDeleteCategory"
            />
          </div>

          <div
            v-if="selectedGroup.categories.length === 0 && addingChildOfId !== -1"
            class="categories-view__empty-tree"
          >
            该维度暂无分类，点击「新增根分类」开始
          </div>
        </template>

        <div v-else class="categories-view__empty-tree">
          {{ groups.length === 0 ? "请先在左侧新建维度" : "请在左侧选择一个维度" }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.categories-view {
  @apply space-y-6;

  &__header {
    @apply space-y-1;
  }

  &__title {
    @apply text-2xl font-bold m-0;
    color: var(--el-text-color-primary);
  }

  &__subtitle {
    @apply text-sm m-0;
    color: var(--el-text-color-secondary);
  }

  &__body {
    @apply flex gap-6;
    min-height: 500px;
  }

  // ── 左侧维度列表 ──
  &__sidebar {
    @apply flex flex-col w-72 flex-shrink-0;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
    overflow: hidden;
  }

  &__sidebar-header {
    @apply flex items-center justify-between px-3 py-2;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &__sidebar-title {
    @apply text-sm font-medium;
    color: var(--el-text-color-primary);
  }

  &__group-list {
    @apply flex flex-col flex-1 overflow-y-auto py-1;
  }

  &__group-input-row {
    @apply flex items-center gap-1 px-2 py-1;
  }

  &__group-item {
    @apply flex items-center gap-1 px-3 py-2 cursor-pointer relative;
    transition: background 0.15s;

    &:hover {
      background: var(--el-fill-color);

      .categories-view__group-actions {
        @apply opacity-100;
      }
    }

    &.is-active {
      background: rgba(99, 102, 241, 0.08);
      border-left: 3px solid var(--el-color-primary);

      .categories-view__group-name {
        color: var(--el-color-primary);
        @apply font-medium;
      }
    }
  }

  &__group-label {
    @apply flex items-center gap-1.5 flex-1 min-w-0;
  }

  &__group-name {
    @apply text-sm truncate;
    color: var(--el-text-color-primary);
  }

  &__group-count {
    @apply text-xs px-1.5 py-0.5 rounded-full flex-shrink-0;
    background: var(--el-fill-color-dark);
    color: var(--el-text-color-secondary);
  }

  &__group-actions {
    @apply opacity-0 flex items-center transition-opacity ml-1;
  }

  &__empty-groups {
    @apply text-sm text-center py-8;
    color: var(--el-text-color-placeholder);
  }

  // ── 右侧分类树 ──
  &__content {
    @apply flex-1 flex flex-col;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
    overflow: hidden;
  }

  &__tree-header {
    @apply flex items-center justify-between px-4 py-2;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &__tree-title {
    @apply text-sm font-medium;
    color: var(--el-text-color-primary);
  }

  &__add-row {
    @apply flex items-center gap-1 px-4 py-2;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__tree {
    @apply flex-1 overflow-y-auto p-2;
  }

  &__empty-tree {
    @apply flex-1 flex items-center justify-center text-sm;
    color: var(--el-text-color-placeholder);
  }
}

// ── 分类树节点（非 scoped，供递归组件使用） ──
</style>

<style lang="scss">
.category-node {
  &__row {
    @apply flex items-center gap-1 px-2 py-1.5 rounded-md;
    transition: background 0.15s;

    &:hover {
      background: var(--el-fill-color);

      .category-node__actions {
        @apply opacity-100;
      }
    }
  }

  &__indent {
    @apply block w-4 flex-shrink-0;
    border-left: 1px dashed var(--el-border-color);
  }

  &__bullet {
    @apply text-sm flex-shrink-0;
    color: var(--el-text-color-secondary);
  }

  &__name {
    @apply flex-1 text-sm;
    color: var(--el-text-color-primary);
  }

  &__input {
    @apply flex-1;
  }

  &__actions {
    @apply opacity-0 flex items-center transition-opacity;
  }

  &__add-row {
    @apply flex items-center gap-1 px-2 py-1;
  }
}
</style>
