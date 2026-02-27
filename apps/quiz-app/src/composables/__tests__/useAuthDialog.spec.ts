/**
 * useAuthDialog 单元测试
 */
import { describe, it, expect } from "vitest";
import { useAuthDialog } from "../useAuthDialog";

describe("useAuthDialog", () => {
  it("初始状态：对话框关闭，Tab 为 login", () => {
    const { showAuthDialog, activeTab } = useAuthDialog();
    expect(showAuthDialog.value).toBe(false);
    expect(activeTab.value).toBe("login");
  });

  it("openLogin 打开对话框并切换到登录 Tab", () => {
    const { showAuthDialog, activeTab, openLogin, close } = useAuthDialog();
    // 先关闭确保初始状态
    close();

    openLogin();
    expect(showAuthDialog.value).toBe(true);
    expect(activeTab.value).toBe("login");
  });

  it("openRegister 打开对话框并切换到注册 Tab", () => {
    const { showAuthDialog, activeTab, openRegister } = useAuthDialog();

    openRegister();
    expect(showAuthDialog.value).toBe(true);
    expect(activeTab.value).toBe("register");
  });

  it("close 关闭对话框", () => {
    const { showAuthDialog, openLogin, close } = useAuthDialog();

    openLogin();
    expect(showAuthDialog.value).toBe(true);

    close();
    expect(showAuthDialog.value).toBe(false);
  });

  it("多次调用共享同一份状态（singleton）", () => {
    const instance1 = useAuthDialog();
    const instance2 = useAuthDialog();

    instance1.openRegister();
    expect(instance2.showAuthDialog.value).toBe(true);
    expect(instance2.activeTab.value).toBe("register");
  });
});
