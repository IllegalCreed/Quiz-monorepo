/**
 * 登录/注册对话框控制
 *
 * 模块级 singleton：所有调用者共享同一份状态，
 * 适用于 App.vue、main.ts 401 回调等多处触发场景。
 */
import { ref } from "vue";

/** 对话框是否可见 */
const showAuthDialog = ref(false);

/** 当前激活的 Tab */
const activeTab = ref<"login" | "register">("login");

export function useAuthDialog() {
  /** 打开登录 Tab */
  function openLogin() {
    activeTab.value = "login";
    showAuthDialog.value = true;
  }

  /** 打开注册 Tab */
  function openRegister() {
    activeTab.value = "register";
    showAuthDialog.value = true;
  }

  /** 关闭对话框 */
  function close() {
    showAuthDialog.value = false;
  }

  return { showAuthDialog, activeTab, openLogin, openRegister, close };
}
