import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import RadioGroup from "../components/RadioGroup.vue";
import Radio from "../components/Radio.vue";

describe("Radio components", () => {
  it("updates v-model on click", async () => {
    const wrapper = mount({
      template: `<RadioGroup v-model="v"><Radio value="a" label="A"/><Radio value="b" label="B"/></RadioGroup>`,
      components: { Radio, RadioGroup },
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
      template: `<RadioGroup v-model="v"><Radio value="a" label="A"/><Radio value="b" label="B"/></RadioGroup>`,
      components: { Radio, RadioGroup },
      data() {
        return { v: "a" };
      },
    });
    const group = wrapper.find('[role="radiogroup"]');
    await group.trigger("keydown", { key: "ArrowRight" });
    const radios2 = wrapper.findAll('[role="radio"]');
    expect(radios2[1].attributes("aria-checked")).toBe("true");
  });
});
