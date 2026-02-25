/**
 * v-permission 指令单元测试
 * 测试按钮级权限控制：有权限保留元素，无权限移除元素
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import type { DirectiveBinding, ObjectDirective, VNode } from "vue";

// 模拟 account store
vi.mock("@/stores/modules/account", () => ({
  useAccountStore: vi.fn(),
}));

import { useAccountStore } from "@/stores/modules/account";
import { permission } from "../permission";

/** permission 强制转型为 ObjectDirective 以访问 mounted 钩子 */
const dir = permission as ObjectDirective;

/** 占位 VNode（指令实现不使用，仅满足类型要求） */
const stubVNode = null as unknown as VNode;

/** 构造 DirectiveBinding */
const makeBinding = (value: string | string[]): DirectiveBinding => ({
  value,
  oldValue: null,
  arg: undefined,
  modifiers: {},
  instance: null,
  dir: permission as ObjectDirective,
});

/** 创建并挂载到 body 的按钮元素 */
const makeEl = () => {
  const el = document.createElement("button");
  document.body.appendChild(el);
  return el;
};

describe("v-permission 指令", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("有匹配权限时保留元素", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { apiPermissions: ["users:delete"] },
    } as unknown as ReturnType<typeof useAccountStore>);

    const el = makeEl();
    dir.mounted!(el, makeBinding("users:delete"), stubVNode, null);
    expect(document.body.contains(el)).toBe(true);
    el.remove();
  });

  it("无匹配权限时移除元素", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { apiPermissions: ["users:list"] },
    } as unknown as ReturnType<typeof useAccountStore>);

    const el = makeEl();
    dir.mounted!(el, makeBinding("users:delete"), stubVNode, null);
    expect(document.body.contains(el)).toBe(false);
  });

  it("数组权限：满足其中一个即保留元素", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { apiPermissions: ["users:list"] },
    } as unknown as ReturnType<typeof useAccountStore>);

    const el = makeEl();
    dir.mounted!(el, makeBinding(["users:list", "users:delete"]), stubVNode, null);
    expect(document.body.contains(el)).toBe(true);
    el.remove();
  });

  it("数组权限：一个都不满足时移除元素", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { apiPermissions: ["questions:list"] },
    } as unknown as ReturnType<typeof useAccountStore>);

    const el = makeEl();
    dir.mounted!(el, makeBinding(["users:list", "users:delete"]), stubVNode, null);
    expect(document.body.contains(el)).toBe(false);
  });

  it("userInfo 为 null 时移除元素", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: null,
    } as unknown as ReturnType<typeof useAccountStore>);

    const el = makeEl();
    dir.mounted!(el, makeBinding("users:delete"), stubVNode, null);
    expect(document.body.contains(el)).toBe(false);
  });

  it("用户拥有多个权限时正确匹配", () => {
    vi.mocked(useAccountStore).mockReturnValue({
      userInfo: { apiPermissions: ["users:list", "users:create", "users:delete"] },
    } as unknown as ReturnType<typeof useAccountStore>);

    const el = makeEl();
    dir.mounted!(el, makeBinding("users:delete"), stubVNode, null);
    expect(document.body.contains(el)).toBe(true);
    el.remove();
  });
});
