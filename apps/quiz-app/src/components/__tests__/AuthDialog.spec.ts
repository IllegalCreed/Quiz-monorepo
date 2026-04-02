/**
 * AuthDialog 组件测试
 *
 * 验证登录/注册弹窗点击遮罩时不会被关闭。
 */
import { nextTick } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import AuthDialog from "../AuthDialog.vue";
import { useAuthDialog } from "@/composables/useAuthDialog";

describe("AuthDialog", () => {
  beforeEach(() => {
    const { close, activeTab } = useAuthDialog();
    close();
    activeTab.value = "login";
    localStorage.clear();
  });

  afterEach(() => {
    const { close } = useAuthDialog();
    close();
    document.body.innerHTML = "";
  });

  it("点击遮罩时保持弹窗打开", async () => {
    const { openLogin, showAuthDialog } = useAuthDialog();

    mount(AuthDialog, {
      attachTo: document.body,
      global: {
        plugins: [createPinia()],
      },
    });

    openLogin();
    await nextTick();
    await flushPromises();

    const overlay = document.querySelector(".dialog-overlay") as HTMLElement | null;
    expect(overlay).toBeTruthy();

    overlay?.click();
    await nextTick();
    await flushPromises();

    expect(showAuthDialog.value).toBe(true);
    expect(document.querySelector(".dialog")).toBeTruthy();
  });
});
