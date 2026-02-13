<script setup lang="ts">
/**
 * 用户菜单下拉组件
 * 使用 el-dropdown command 模式处理操作
 */
import { ElMessage, ElMessageBox } from "element-plus";
import { useAccountStore } from "@/stores/modules/account";
import { useRouterStore } from "@/stores/modules/router";
import { useToken } from "@/composables/use-token";
import { resetRoutesInitialized } from "@/router/dynamic-routes";
import { useRouter } from "vue-router";

const accountStore = useAccountStore();
const routerStore = useRouterStore();
const { clearToken } = useToken();
const router = useRouter();

/**
 * 处理下拉命令
 */
const handleCommand = async (command: string) => {
  if (command === "logout") {
    await handleLogout();
  }
};

/**
 * 处理登出
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm("确定退出登录吗？", "提示", {
      type: "warning",
    });

    // 调用登出 API
    await accountStore.logout();

    // 清除本地状态
    clearToken();
    routerStore.clearAllViews();
    resetRoutesInitialized();

    // 跳转到登录页
    router.push("/login");
    ElMessage.success("已退出登录");
  } catch {
    // 用户取消
  }
};
</script>

<template>
  <el-dropdown class="user-dropdown" @command="handleCommand">
    <span class="user-info">
      <i-carbon-user class="w-5 h-5" />
      <span class="user-nickname nickname">{{ accountStore.userInfo?.nickname }}</span>
      <i-carbon-chevron-down class="w-3 h-3" />
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item class="dropdown-item" command="logout">
          <i-carbon-logout class="w-4 h-4 mr-2" />
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.user-info {
  @apply flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg;
  @apply hover:bg-gray-100 dark:hover:bg-slate-700;
  @apply text-gray-700 dark:text-slate-200;
  transition: background-color 0.2s;
}

.user-nickname {
  @apply text-sm font-medium;
}
</style>
