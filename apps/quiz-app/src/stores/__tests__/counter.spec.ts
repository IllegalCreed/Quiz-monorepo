/**
 * useCounterStore 单元测试
 */
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCounterStore } from "../counter";

describe("useCounterStore", () => {
  beforeEach(() => {
    // 每个测试使用独立的 Pinia 实例，隔离 store 状态
    setActivePinia(createPinia());
  });

  it("初始 count 为 0", () => {
    const store = useCounterStore();
    expect(store.count).toBe(0);
  });

  it("doubleCount 计算属性等于 count 的两倍", () => {
    const store = useCounterStore();
    expect(store.doubleCount).toBe(0);
    store.count = 5;
    expect(store.doubleCount).toBe(10);
  });

  it("increment 使 count 加一", () => {
    const store = useCounterStore();
    store.increment();
    expect(store.count).toBe(1);
    store.increment();
    expect(store.count).toBe(2);
  });

  it("多次 increment 累加正确", () => {
    const store = useCounterStore();
    for (let i = 0; i < 5; i++) store.increment();
    expect(store.count).toBe(5);
    expect(store.doubleCount).toBe(10);
  });
});
