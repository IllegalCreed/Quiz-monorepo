/**
 * CheckRadio 组件测试
 *
 * @remarks
 * - 验证交互行为：点击时 Group 能更新 v-model；当提供 `correctValue` 时会展示正确/错误的视觉状态。
 * - 使用 @vue/test-utils 挂载组件，使用 vitest 作为测试运行器。
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";
import CheckRadio from "../components/CheckRadio.vue";

describe("CheckRadio 组件", () => {
  it("点击时更新 v-model", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="v" :options="opts" />`,
      components: { CheckRadio, CheckRadioGroup },
      data() {
        return {
          v: null,
          opts: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
            { value: "c", label: "C" },
            { value: "d", label: "D" },
          ],
        };
      },
    });
    const radios = wrapper.findAllComponents(CheckRadio);
    await radios[1].find("button").trigger("click");

    expect(wrapper.vm.v).toBe("b");
  });

  it("提供 correctValue 时标记正确/错误", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="v" :options="opts" :correctValue="'b'" />`,
      components: { CheckRadio, CheckRadioGroup },
      data() {
        return {
          v: null,
          opts: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
            { value: "c", label: "C" },
            { value: "d", label: "D" },
          ],
        };
      },
    });
    const radios = wrapper.findAll(".radio");
    await radios[0].find("button").trigger("click");
    await wrapper.vm.$nextTick();
    expect(radios[0].classes()).toContain("radio--incorrect");
    expect(radios[1].classes()).toContain("radio--correct");
    // Group no longer emits `answered` (v-model change is source of truth)
    expect(
      wrapper.findComponent(CheckRadioGroup).emitted("answered"),
    ).toBeUndefined();
  });
});
