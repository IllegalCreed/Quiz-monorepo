/**
 * useMockStore 单元测试
 */
import { describe, it, expect } from "vitest";
import { useMockStore } from "../useMockStore";

describe("useMockStore", () => {
  it("VITE_MOCK 未设置时 isMock 默认为 false", () => {
    const { isMock } = useMockStore();
    // 测试环境中 VITE_MOCK 不是 "true"，所以 isMock 应为 false
    expect(isMock.value).toBe(false);
  });

  it("setMock(true) 将 isMock 切换为 true", () => {
    const { isMock, setMock } = useMockStore();
    setMock(true);
    expect(isMock.value).toBe(true);
  });

  it("setMock(false) 将 isMock 切换回 false", () => {
    const { isMock, setMock } = useMockStore();
    setMock(true);
    setMock(false);
    expect(isMock.value).toBe(false);
  });

  it("每次调用返回独立的 ref 实例", () => {
    const store1 = useMockStore();
    const store2 = useMockStore();
    store1.setMock(true);
    // useMockStore 不是单例，store2 不受 store1 影响
    expect(store2.isMock.value).toBe(false);
  });
});
