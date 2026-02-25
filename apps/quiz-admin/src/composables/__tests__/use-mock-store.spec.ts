/**
 * useMockStore composable 单元测试
 */
import { describe, it, expect } from "vitest";
import { useMockStore } from "../use-mock-store";

describe("useMockStore", () => {
  it("VITE_MOCK 未设置时 isMock 默认为 false", () => {
    const { isMock } = useMockStore();
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

  it("每次调用返回独立实例，互不影响", () => {
    const a = useMockStore();
    const b = useMockStore();
    a.setMock(true);
    expect(b.isMock.value).toBe(false);
  });
});
