<script setup lang="ts">
/**
 * 用户菜单下拉组件
 * 使用 el-dropdown command 模式处理操作
 */
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useAccountStore } from "@/stores/modules/account";
import { useRouterStore } from "@/stores/modules/router";
import { useToken } from "@/composables/use-token";
import { resetRoutesInitialized } from "@/router/dynamic-routes";
import { useRouter } from "vue-router";

const accountStore = useAccountStore();
const routerStore = useRouterStore();
const { clearToken } = useToken();
const router = useRouter();

// ==================== 修改密码 ====================

const changePasswordVisible = ref(false);
const changePasswordLoading = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const rules: FormRules = {
  currentPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "新密码至少 6 位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (_rule: unknown, value: string, callback: (e?: Error) => void) => {
        if (value !== form.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

/**
 * 重置修改密码表单
 */
const resetChangePasswordForm = () => {
  form.currentPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
  formRef.value?.clearValidate();
};

/**
 * 提交修改密码
 */
const handleChangePasswordSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  changePasswordLoading.value = true;
  try {
    await accountStore.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    ElMessage.success("密码修改成功，请重新登录");
    changePasswordVisible.value = false;
    // 修改密码后强制重新登录
    clearToken();
    routerStore.clearAllViews();
    resetRoutesInitialized();
    router.push("/login");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "密码修改失败");
  } finally {
    changePasswordLoading.value = false;
  }
};

// ==================== 下拉菜单 ====================

/**
 * 处理下拉命令
 */
const handleCommand = async (command: string) => {
  if (command === "changePassword") {
    resetChangePasswordForm();
    changePasswordVisible.value = true;
  } else if (command === "logout") {
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
        <el-dropdown-item class="dropdown-item" command="changePassword">
          <i-carbon-password class="w-4 h-4 mr-2" />
          修改密码
        </el-dropdown-item>
        <el-dropdown-item class="dropdown-item" command="logout">
          <i-carbon-logout class="w-4 h-4 mr-2" />
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 修改密码对话框 -->
  <el-dialog
    v-model="changePasswordVisible"
    title="修改密码"
    width="400px"
    @closed="resetChangePasswordForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input
          v-model="form.currentPassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
          autocomplete="current-password"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码（至少 6 位）"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="changePasswordVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="changePasswordLoading"
        @click="handleChangePasswordSubmit"
      >
        确认修改
      </el-button>
    </template>
  </el-dialog>
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
