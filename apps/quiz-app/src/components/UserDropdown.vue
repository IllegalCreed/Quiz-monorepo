<script setup lang="ts">
/**
 * UserDropdown — 登录后用户下拉菜单
 *
 * 使用 BasePopover 显示用户操作菜单。
 * 菜单项：做题历史、分类偏好、退出登录
 */
import { ref } from "vue";
import { BasePopover } from "@quiz/ui";
import { useUserStore } from "@/stores/useUserStore";
import { useHistory } from "@/composables/useHistory";
import { useCategories } from "@/composables/useCategories";

const userStore = useUserStore();
const { openDrawer } = useHistory();
const { showSelector, clearSelection } = useCategories();

/** Popover 组件引用 */
const popoverRef = ref<InstanceType<typeof BasePopover>>();

/** 打开做题历史抽屉 */
function handleHistory() {
  openDrawer();
  popoverRef.value?.close();
}

/** 打开分类偏好选择器 */
function handlePreferences() {
  showSelector.value = true;
  popoverRef.value?.close();
}

/** 退出登录：清空用户状态 + 分类偏好 */
function handleLogout() {
  userStore.logout();
  clearSelection();
  popoverRef.value?.close();
}
</script>

<template>
  <BasePopover ref="popoverRef" placement="bottom-end" :offset="8">
    <!-- 触发按钮：用户头像图标 -->
    <template #trigger>
      <button
        class="user-trigger"
        :aria-label="`用户菜单: ${userStore.userInfo?.nickname || userStore.userInfo?.username}`"
      >
        <i class="i-carbon-user-avatar w-5 h-5" aria-hidden="true" />
      </button>
    </template>

    <!-- 下拉菜单内容 -->
    <div class="user-menu">
      <!-- 用户信息 -->
      <div class="user-menu__info">
        <span class="user-menu__name">
          {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
        </span>
        <span v-if="userStore.userInfo?.nickname" class="user-menu__username">
          @{{ userStore.userInfo?.username }}
        </span>
      </div>

      <div class="user-menu__divider" />

      <!-- 做题历史 -->
      <button class="user-menu__item" @click="handleHistory">
        <i class="i-carbon-time w-4 h-4" aria-hidden="true" />
        <span>做题历史</span>
      </button>

      <!-- 分类偏好 -->
      <button class="user-menu__item" @click="handlePreferences">
        <i class="i-carbon-settings w-4 h-4" aria-hidden="true" />
        <span>分类偏好</span>
      </button>

      <div class="user-menu__divider" />

      <!-- 退出登录 -->
      <button class="user-menu__item user-menu__item--danger" @click="handleLogout">
        <i class="i-carbon-logout w-4 h-4" aria-hidden="true" />
        <span>退出登录</span>
      </button>
    </div>
  </BasePopover>
</template>

<style scoped lang="scss">
/* ── 触发按钮 ─────────────────────────────────────── */
.user-trigger {
  @apply inline-flex items-center justify-center;
  @apply w-8 h-8 rounded-full cursor-pointer;
  background: transparent;
  border: none;
  color: var(--quiz-ui-text);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--quiz-ui-control-bg);
  }

  &:focus-visible {
    @apply outline-none;
    box-shadow: 0 0 0 3px var(--quiz-ui-focus);
  }
}

/* ── 下拉菜单 ─────────────────────────────────────── */
.user-menu {
  @apply flex flex-col py-1;
  min-width: 12rem;

  /* 用户信息区 */
  &__info {
    @apply flex flex-col px-3 py-2;
  }

  &__name {
    @apply text-sm font-medium;
    color: var(--quiz-ui-text);
  }

  &__username {
    @apply text-xs;
    color: var(--quiz-ui-muted);
  }

  /* 分隔线 */
  &__divider {
    @apply my-1;
    height: 1px;
    background-color: var(--quiz-ui-border);
  }

  /* 菜单项 */
  &__item {
    @apply flex items-center gap-2 px-3 py-2 text-sm cursor-pointer;
    background: transparent;
    border: none;
    color: var(--quiz-ui-text);
    transition: background-color 0.15s ease;
    text-align: left;
    width: 100%;

    &:hover:not(:disabled) {
      background-color: var(--quiz-ui-control-bg);
    }

    /* 危险操作（退出登录） */
    &--danger {
      color: var(--quiz-ui-danger, #ef4444);

      &:hover {
        background-color: rgba(239, 68, 68, 0.08);
      }
    }
  }
}
</style>
