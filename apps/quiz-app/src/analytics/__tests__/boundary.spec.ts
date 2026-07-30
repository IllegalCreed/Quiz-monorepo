import { describe, expect, it } from "vitest";
import appSource from "../../App.vue?raw";
import indexSource from "../../../index.html?raw";

describe("隐私边界静态门禁", () => {
  it("HTML 壳不再无条件加载统计或广告脚本", () => {
    expect(indexSource).not.toContain("googletagmanager.com");
    expect(indexSource).not.toContain("hm.baidu.com");
    expect(indexSource).not.toContain("adsbygoogle.js");
  });

  it("SSE 心跳只发送 pathname，不发送完整查询参数", () => {
    expect(appSource).not.toContain(".fullPath");
    expect(appSource).toContain(".path");
  });
});
