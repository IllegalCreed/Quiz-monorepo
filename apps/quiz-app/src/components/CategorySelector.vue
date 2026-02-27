<script setup lang="ts">
/**
 * CategorySelector — 分类选择器对话框
 *
 * BaseDialog center 模式，内嵌 ColumnSelector 组件。
 * 打开时拷贝当前选中，确认后应用，取消不保存。
 */
import { ref, watch } from "vue";
import { BaseDialog, BaseButton, ColumnSelector } from "@quiz/ui";
import { useCategories } from "@/composables/useCategories";
import { useUserStore } from "@/stores/useUserStore";

const userStore = useUserStore();
const { treeData, selectedIds, showSelector, applySelection, loadGroups } = useCategories();

/** 临时选中状态（对话框内编辑，不影响外部） */
const tempSelected = ref<(string | number)[]>([]);

/** 打开对话框时：加载分类数据 + 拷贝当前选中 */
watch(showSelector, async (open) => {
  if (open) {
    await loadGroups();
    tempSelected.value = [...selectedIds.value];
  }
});

/** 取消：关闭不保存 */
function handleCancel() {
  showSelector.value = false;
}

/** 确认：应用选中并关闭 */
async function handleConfirm() {
  await applySelection(tempSelected.value.map(Number), userStore.isLoggedIn);
  showSelector.value = false;
}
</script>

<template>
  <BaseDialog v-model="showSelector" placement="center" width="36rem">
    <template #header>
      <h3 class="selector-title">选择分类</h3>
    </template>

    <!-- ColumnSelector 分栏选择器 -->
    <div class="selector-body">
      <ColumnSelector v-model="tempSelected" :data="treeData" search-placeholder="搜索分类..." />
    </div>

    <template #footer>
      <div class="selector-footer">
        <BaseButton variant="ghost" @click="handleCancel">取消</BaseButton>
        <BaseButton @click="handleConfirm">确认</BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped lang="scss">
.selector-title {
  @apply m-0 text-lg font-semibold;
  color: var(--quiz-ui-text);
}

.selector-body {
  @apply py-2;
}

.selector-footer {
  @apply flex justify-end gap-2;
}
</style>
