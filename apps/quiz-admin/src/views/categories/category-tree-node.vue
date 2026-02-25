<script setup lang="ts">
/**
 * 分类树节点（递归组件）
 * 供 categories-view.vue 使用，支持无限层级嵌套
 */
import type { CategoryItem } from "@/types/category";

defineOptions({ name: "CategoryTreeNode" });

defineProps<{
  node: CategoryItem;
  depth: number;
  editingId: number | null;
  editingName: string;
  addingChildOfId: number | null;
  newCategoryName: string;
}>();

const emit = defineEmits<{
  "update:editingName": [value: string];
  "update:newCategoryName": [value: string];
  startEdit: [node: CategoryItem];
  confirmEdit: [id: number];
  cancelEdit: [];
  startAddChild: [parentId: number];
  confirmAdd: [];
  cancelAdd: [];
  delete: [node: CategoryItem];
}>();
</script>

<template>
  <div class="category-node">
    <div class="category-node__row">
      <!-- 缩进指示线 -->
      <span v-for="i in depth" :key="i" class="category-node__indent" />

      <!-- 编辑状态 -->
      <template v-if="editingId === node.id">
        <el-input
          :model-value="editingName"
          size="small"
          autofocus
          class="category-node__input"
          @update:model-value="emit('update:editingName', $event)"
          @keyup.enter="emit('confirmEdit', node.id)"
          @keyup.esc="emit('cancelEdit')"
        />
        <el-button size="small" type="primary" text @click="emit('confirmEdit', node.id)">
          <i class="i-carbon-checkmark" />
        </el-button>
        <el-button size="small" text @click="emit('cancelEdit')">
          <i class="i-carbon-close" />
        </el-button>
      </template>

      <!-- 普通状态 -->
      <template v-else>
        <i class="category-node__bullet i-carbon-folder" />
        <span class="category-node__name">{{ node.name }}</span>
        <div class="category-node__actions">
          <el-button size="small" text @click="emit('startAddChild', node.id)">
            <i class="i-carbon-add" />
          </el-button>
          <el-button size="small" text @click="emit('startEdit', node)">
            <i class="i-carbon-edit" />
          </el-button>
          <el-button size="small" text type="danger" @click="emit('delete', node)">
            <i class="i-carbon-trash-can" />
          </el-button>
        </div>
      </template>
    </div>

    <!-- 在该节点下新增子节点的输入行 -->
    <div v-if="addingChildOfId === node.id" class="category-node__add-row">
      <span v-for="i in depth + 1" :key="i" class="category-node__indent" />
      <el-input
        :model-value="newCategoryName"
        size="small"
        autofocus
        placeholder="输入子分类名称"
        class="category-node__input"
        @update:model-value="emit('update:newCategoryName', $event)"
        @keyup.enter="emit('confirmAdd')"
        @keyup.esc="emit('cancelAdd')"
      />
      <el-button size="small" type="primary" @click="emit('confirmAdd')">确认</el-button>
      <el-button size="small" @click="emit('cancelAdd')">取消</el-button>
    </div>

    <!-- 递归渲染子节点 -->
    <CategoryTreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :depth="depth + 1"
      :editing-id="editingId"
      :editing-name="editingName"
      :adding-child-of-id="addingChildOfId"
      :new-category-name="newCategoryName"
      @update:editing-name="emit('update:editingName', $event)"
      @update:new-category-name="emit('update:newCategoryName', $event)"
      @start-edit="emit('startEdit', $event)"
      @confirm-edit="emit('confirmEdit', $event)"
      @cancel-edit="emit('cancelEdit')"
      @start-add-child="emit('startAddChild', $event)"
      @confirm-add="emit('confirmAdd')"
      @cancel-add="emit('cancelAdd')"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
