import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";
import CheckRadio from "../components/CheckRadio.vue";

describe("CheckRadio components", () => {
  it("updates v-model on click", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="v"><CheckRadio value="a" label="A"/><CheckRadio value="b" label="B"/><CheckRadio value="c" label="C"/><CheckRadio value="d" label="D"/></CheckRadioGroup>`,
      components: { CheckRadio, CheckRadioGroup },
      data() {
        return { v: null };
      },
    });
    const radios = wrapper.findAll('[role="radio"]');
    await radios[1].trigger("click");

    expect(radios[1].attributes("aria-checked")).toBe("true");
  });

  it("keyboard navigation works", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="v"><CheckRadio value="a" label="A"/><CheckRadio value="b" label="B"/><CheckRadio value="c" label="C"/><CheckRadio value="d" label="D"/></CheckRadioGroup>`,
      components: { CheckRadio, CheckRadioGroup },
      data() {
        return { v: "a" };
      },
    });
    const group = wrapper.find('[role="radiogroup"]');
    await group.trigger("keydown", { key: "ArrowRight" });
    const radios2 = wrapper.findAll('[role="radio"]');
    expect(radios2[1].attributes("aria-checked")).toBe("true");
  });

  it("marks incorrect and correct and emits answered", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="v" :correctValue="'b'"><CheckRadio value="a" label="A"/><CheckRadio value="b" label="B"/><CheckRadio value="c" label="C"/><CheckRadio value="d" label="D"/></CheckRadioGroup>`,
      components: { CheckRadio, CheckRadioGroup },
      data() {
        return { v: null };
      },
    });
    const radios = wrapper.findAll('[role="radio"]');
    await radios[0].trigger("click");
    await wrapper.vm.$nextTick();
    expect(radios[0].classes()).toContain("radio--incorrect");
    expect(radios[1].classes()).toContain("radio--correct");
    const ev = wrapper
      .findComponent(CheckRadioGroup)
      .emitted("answered")?.[0][0];
    expect(ev).toMatchObject({
      value: "a",
      isCorrect: false,
      correctValue: "b",
    });
  });
});
