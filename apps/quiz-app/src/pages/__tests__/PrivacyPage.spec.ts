import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PrivacyPage from "../PrivacyPage.vue";

describe("PrivacyPage", () => {
  it("准确覆盖账号、答题历史、在线状态、分析与广告边界", () => {
    const wrapper = mount(PrivacyPage);
    const text = wrapper.text();

    expect(text).toContain("可选账号");
    expect(text).toContain("密码哈希");
    expect(text).toContain("答题历史");
    expect(text).toContain("分类偏好");
    expect(text).toContain("在线客户端");
    expect(text).toContain("Google Analytics");
    expect(text).toContain("百度统计");
    expect(text).toContain("AdSense");
    expect(text).toContain("不会发送题目、答案或账号标识");
    expect(text).toContain("通用操作日志还可能");
  });
});
