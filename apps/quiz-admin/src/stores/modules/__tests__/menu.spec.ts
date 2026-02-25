/**
 * useMenuStore 单元测试
 * 测试菜单权限过滤逻辑
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// 模拟 account store，隔离菜单 store 与账号逻辑的耦合
vi.mock("@/stores/modules/account", () => ({
  useAccountStore: vi.fn(),
}));

import { useAccountStore } from "@/stores/modules/account";
import { useMenuStore } from "../menu";

describe("useMenuStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("userInfo 为 null 时菜单列表为空", () => {
    vi.mocked(useAccountStore).mockReturnValue({ userInfo: null } as unknown as ReturnType<
      typeof useAccountStore
    >);
    const store = useMenuStore();
    expect(store.menus).toHaveLength(0);
  });

  it("无菜单权限时菜单列表为空", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { menuPermissions: [] },
    } as unknown as ReturnType<typeof useAccountStore>);
    const store = useMenuStore();
    expect(store.menus).toHaveLength(0);
  });

  it("超级管理员（通配符 *）显示全部菜单", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { menuPermissions: ["*"] },
    } as unknown as ReturnType<typeof useAccountStore>);
    const store = useMenuStore();
    // 应包含所有已定义的菜单
    expect(store.menus.length).toBeGreaterThan(0);
    const names = store.menus.map((m) => m.name);
    expect(names).toContain("dashboard");
    expect(names).toContain("users");
    expect(names).toContain("questions");
    expect(names).toContain("admins");
    expect(names).toContain("roles");
  });

  it("只有 dashboard 权限时仅返回欢迎页菜单", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { menuPermissions: ["dashboard"] },
    } as unknown as ReturnType<typeof useAccountStore>);
    const store = useMenuStore();
    expect(store.menus).toHaveLength(1);
    expect(store.menus[0]!.name).toBe("dashboard");
  });

  it("多个权限时返回对应菜单", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { menuPermissions: ["dashboard", "users", "roles"] },
    } as unknown as ReturnType<typeof useAccountStore>);
    const store = useMenuStore();
    expect(store.menus).toHaveLength(3);
    const names = store.menus.map((m) => m.name);
    expect(names).toEqual(expect.arrayContaining(["dashboard", "users", "roles"]));
  });

  it("无效权限名不影响已有权限", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { menuPermissions: ["dashboard", "nonexistent"] },
    } as unknown as ReturnType<typeof useAccountStore>);
    const store = useMenuStore();
    expect(store.menus).toHaveLength(1);
    expect(store.menus[0]!.name).toBe("dashboard");
  });

  it("每个菜单项包含必要字段", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { menuPermissions: ["*"] },
    } as unknown as ReturnType<typeof useAccountStore>);
    const store = useMenuStore();
    for (const menu of store.menus) {
      expect(menu).toHaveProperty("index");
      expect(menu).toHaveProperty("name");
      expect(menu).toHaveProperty("title");
      expect(menu).toHaveProperty("icon");
    }
  });
});
