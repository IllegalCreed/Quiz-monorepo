<template>
  <!-- Miller Columns 分栏选择器 -->
  <div class="column-selector">
    <!-- 搜索框 -->
    <div v-if="searchable" class="column-selector__search">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
      />
    </div>

    <!-- 分栏区域 -->
    <div class="column-selector__columns">
      <!-- 搜索模式：扁平列表 -->
      <div
        v-if="searchQuery"
        class="column-selector__column"
        style="min-width: 100%"
      >
        <div v-if="filteredNodes.length === 0" class="column-selector__empty">
          无匹配结果
        </div>
        <div
          v-for="node in filteredNodes"
          :key="node.id"
          class="column-selector__node"
        >
          <span
            :class="indicatorClass(node)"
            @click.stop="toggleSelect(node)"
          />
          <span class="column-selector__label">{{ getPath(node) }}</span>
        </div>
      </div>

      <!-- 正常模式：多列分栏 -->
      <template v-else>
        <div
          v-for="(column, colIdx) in columns"
          :key="colIdx"
          class="column-selector__column"
        >
          <div
            v-for="node in column"
            :key="node.id"
            :class="[
              'column-selector__node',
              { 'column-selector__node--active': isOnActivePath(node, colIdx) },
            ]"
            @click="onNodeClick(node, colIdx)"
          >
            <!-- 选中指示器 -->
            <span
              :class="indicatorClass(node)"
              @click.stop="toggleSelect(node)"
            />
            <!-- 节点名称 -->
            <span class="column-selector__label">{{ node.label }}</span>
            <!-- 有子级的箭头 -->
            <span v-if="hasChildren(node)" class="column-selector__arrow"
              >›</span
            >
          </div>
        </div>
      </template>
    </div>

    <!-- 已选摘要 -->
    <div v-if="selectedNodes.length > 0" class="column-selector__summary">
      <BaseTag
        v-for="node in selectedNodes"
        :key="node.id"
        size="md"
        removable
        @remove="removeSelection(node)"
      >
        {{ node.label }}
      </BaseTag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import BaseTag from "./BaseTag.vue";

/**
 * ColumnSelector 组件（Miller Columns 分栏选择器）
 *
 * @remarks
 * - 通用树形多选组件，macOS Finder 风格分栏浏览器
 * - 输入标准 TreeNode 接口数据，输出选中 ID 数组
 * - 三态选中：● 全选 / ◐ 半选 / ○ 未选中
 * - 选中父级自动包含所有后代叶子，取消子级则父级变为半选
 */
defineOptions({ name: "ColumnSelector" });

/**
 * 树节点接口
 */
export interface TreeNode {
  /** 节点唯一 ID */
  id: string | number;
  /** 节点显示文字 */
  label: string;
  /** 子节点 */
  children?: TreeNode[];
}

/**
 * ColumnSelector Props 类型
 */
export interface ColumnSelectorProps {
  /** 选中节点 ID 数组 */
  modelValue?: (string | number)[];
  /** 树形数据 */
  data: TreeNode[];
  /** 是否显示搜索框 */
  searchable?: boolean;
  /** 搜索框占位文字 */
  searchPlaceholder?: string;
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<(string | number)[]>,
    default: () => [],
  },
  data: {
    type: Array as PropType<TreeNode[]>,
    required: true,
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  searchPlaceholder: {
    type: String,
    default: "搜索...",
  },
});

const emit = defineEmits<{
  "update:modelValue": [value: (string | number)[]];
}>();

/** 搜索关键词 */
const searchQuery = ref("");

/** 当前展开路径（每列选中的节点 ID） */
const activePath = ref<(string | number)[]>([]);

// ═══════════════════════════════════════════════════════════════
// 辅助：树形工具函数
// ═══════════════════════════════════════════════════════════════

/**
 * 判断节点是否有子节点
 */
function hasChildren(node: TreeNode): boolean {
  return !!(node.children && node.children.length > 0);
}

/**
 * 收集节点下所有叶子节点 ID
 */
function collectLeafIds(node: TreeNode): (string | number)[] {
  if (!hasChildren(node)) return [node.id];
  return node.children!.flatMap((child) => collectLeafIds(child));
}

/**
 * 获取节点的完整路径文字（搜索结果用）
 */
function getPath(target: TreeNode): string {
  const path: string[] = [];
  function walk(nodes: TreeNode[], trail: string[]): boolean {
    for (const node of nodes) {
      const current = [...trail, node.label];
      if (node.id === target.id) {
        path.push(...current);
        return true;
      }
      if (hasChildren(node) && walk(node.children!, current)) return true;
    }
    return false;
  }
  walk(props.data, []);
  return path.join(" / ");
}

/**
 * 收集所有叶子节点（搜索 + 扁平化用）
 */
function collectAllNodes(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (hasChildren(node)) {
      result.push(...collectAllNodes(node.children!));
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// 选中状态计算
// ═══════════════════════════════════════════════════════════════

/** 当前选中 ID Set（方便查找） */
const selectedSet = computed(() => new Set(props.modelValue));

/**
 * 获取节点的选中状态
 *
 * @returns "selected" | "indeterminate" | "none"
 */
function getSelectState(node: TreeNode): "selected" | "indeterminate" | "none" {
  // 叶子节点：直接判断
  if (!hasChildren(node)) {
    return selectedSet.value.has(node.id) ? "selected" : "none";
  }

  // 非叶子节点：看所有叶子后代的选中情况
  const leafIds = collectLeafIds(node);
  const selectedCount = leafIds.filter((id) =>
    selectedSet.value.has(id),
  ).length;

  if (selectedCount === 0) return "none";
  if (selectedCount === leafIds.length) return "selected";
  return "indeterminate";
}

/**
 * 计算选中指示器 CSS 类名
 */
function indicatorClass(node: TreeNode): string[] {
  const state = getSelectState(node);
  return [
    "column-selector__indicator",
    state === "selected" ? "column-selector__indicator--selected" : "",
    state === "indeterminate"
      ? "column-selector__indicator--indeterminate"
      : "",
  ].filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════
// 交互处理
// ═══════════════════════════════════════════════════════════════

/**
 * 点击节点文字：展开子级到右列
 */
function onNodeClick(node: TreeNode, colIdx: number) {
  if (hasChildren(node)) {
    // 截断路径到当前列，设置新的展开节点
    activePath.value = [...activePath.value.slice(0, colIdx), node.id];
  }
}

/**
 * 判断节点是否在当前展开路径上
 */
function isOnActivePath(node: TreeNode, colIdx: number): boolean {
  return activePath.value[colIdx] === node.id;
}

/**
 * 切换节点选中状态
 */
function toggleSelect(node: TreeNode) {
  const state = getSelectState(node);
  const current = new Set(props.modelValue);

  if (state === "selected") {
    // 取消选中：移除该节点及其所有后代叶子
    const leafIds = collectLeafIds(node);
    for (const id of leafIds) {
      current.delete(id);
    }
  } else {
    // 选中：添加所有叶子后代
    const leafIds = collectLeafIds(node);
    for (const id of leafIds) {
      current.add(id);
    }
  }

  emit("update:modelValue", [...current]);
}

/**
 * 从已选摘要中移除单个节点
 */
function removeSelection(node: TreeNode) {
  const current = new Set(props.modelValue);
  const leafIds = collectLeafIds(node);
  for (const id of leafIds) {
    current.delete(id);
  }
  emit("update:modelValue", [...current]);
}

// ═══════════════════════════════════════════════════════════════
// 计算属性
// ═══════════════════════════════════════════════════════════════

/**
 * 分栏数据：根据 activePath 构建每列的节点列表
 */
const columns = computed(() => {
  const result: TreeNode[][] = [props.data];

  for (const activeId of activePath.value) {
    const lastColumn = result[result.length - 1]!;
    const activeNode = lastColumn.find((n) => n.id === activeId);
    if (activeNode && hasChildren(activeNode)) {
      result.push(activeNode.children!);
    } else {
      break;
    }
  }

  return result;
});

/**
 * 搜索结果（关键词过滤所有节点）
 */
const filteredNodes = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return collectAllNodes(props.data).filter((node) =>
    node.label.toLowerCase().includes(query),
  );
});

/**
 * 已选节点列表（摘要区展示用）
 */
const selectedNodes = computed(() => {
  const allNodes = collectAllNodes(props.data);
  return allNodes.filter(
    (node) => !hasChildren(node) && selectedSet.value.has(node.id),
  );
});
</script>

<style lang="scss" scoped>
@use "./column-selector.scss" as *;
</style>
