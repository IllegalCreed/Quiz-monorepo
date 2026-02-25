/**
 * permissions mock API 单元测试
 * 验证返回数据形状与常量一致
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { ALL_MENU_PERMISSIONS, ALL_API_PERMISSION_GROUPS } from "@/types/permission";

// 使用 fake timers 跳过模拟网络延迟
beforeAll(() => vi.useFakeTimers());
afterAll(() => vi.useRealTimers());

import { getMenuPermissions, getApiPermissions, getPermissionRouteMapping } from "../permissions";

describe("getMenuPermissions", () => {
  it("返回非空菜单权限列表", async () => {
    const promise = getMenuPermissions();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result.length).toBeGreaterThan(0);
  });

  it("返回与 ALL_MENU_PERMISSIONS 相同的数据", async () => {
    const promise = getMenuPermissions();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toEqual(ALL_MENU_PERMISSIONS);
  });

  it("每项包含 key 和 label 字段", async () => {
    const promise = getMenuPermissions();
    await vi.runAllTimersAsync();
    const result = await promise;
    for (const item of result) {
      expect(item).toHaveProperty("key");
      expect(item).toHaveProperty("label");
    }
  });

  it("返回副本，修改不影响原数据", async () => {
    const p1 = getMenuPermissions();
    const p2 = getMenuPermissions();
    await vi.runAllTimersAsync();
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).not.toBe(r2); // 不同引用
    expect(r1).toEqual(r2);
  });
});

describe("getApiPermissions", () => {
  it("返回非空 API 权限分组", async () => {
    const promise = getApiPermissions();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result.length).toBeGreaterThan(0);
  });

  it("返回与 ALL_API_PERMISSION_GROUPS 相同的数据", async () => {
    const promise = getApiPermissions();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toEqual(ALL_API_PERMISSION_GROUPS);
  });

  it("每个分组包含 module 和 permissions 字段", async () => {
    const promise = getApiPermissions();
    await vi.runAllTimersAsync();
    const result = await promise;
    for (const group of result) {
      expect(group).toHaveProperty("module");
      expect(group).toHaveProperty("permissions");
      expect(Array.isArray(group.permissions)).toBe(true);
    }
  });
});

describe("getPermissionRouteMapping", () => {
  it("返回权限路由映射对象", async () => {
    const promise = getPermissionRouteMapping();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(typeof result).toBe("object");
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it("dashboard 权限映射到 dashboard 路由", async () => {
    const promise = getPermissionRouteMapping();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result["dashboard"]).toContain("dashboard");
  });

  it("questions 权限映射包含 question-detail", async () => {
    const promise = getPermissionRouteMapping();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result["questions"]).toContain("question-detail");
  });
});
