/**
 * CheckRadio 的 Storybook 示例
 *
 * @remarks
 * - 演示 `CheckRadio` 的独立使用（普通 / 正确 / 错误 状态）。
 * - 演示数据驱动的 `CheckRadioGroup`（通过 `options` 提供项，支持 `correctValue`）。
 * - 用于人工验证视觉状态与 v-model 行为。
 */
import CheckRadio from "../components/CheckRadio.vue";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";

export default {
  title: "组件/单选",
  component: CheckRadioGroup,
};

/**
 * 独立示例 — 未选择
 *
 * @remarks
 * 展示 `CheckRadio` 在未选择状态下的默认渲染，用于验证控件的基础样式。
 */
export const StandaloneUnselected = {
  render: () => ({
    components: { CheckRadio },
    template: `<div style="padding:12px"><CheckRadio value="a" label="示例选项 A"/></div>`,
  }),
  name: "独立：未选择",
};

/**
 * 独立示例 — 正确状态
 *
 * @remarks
 * 演示 `CheckRadio` 在 `status="correct"` 时的视觉样式，便于校验正确标识。
 */
export const StandaloneCorrect = {
  render: () => ({
    components: { CheckRadio },
    template: `<div style="padding:12px"><CheckRadio value="a" label="正确选项" status="correct"/></div>`,
  }),
  name: "独立：正确",
};

/**
 * 独立示例 — 错误状态
 *
 * @remarks
 * 演示 `CheckRadio` 在 `status="incorrect"` 时的视觉样式，便于校验错误标识。
 */
export const StandaloneIncorrect = {
  render: () => ({
    components: { CheckRadio },
    template: `<div style="padding:12px"><CheckRadio value="a" label="错误选项" status="incorrect"/></div>`,
  }),
  name: "独立：错误",
};

/**
 * 独立示例 — 带描述
 *
 * @remarks
 * 展示 `CheckRadio` 的 `description` 字段如何渲染，适用于显示补充说明或上下文信息。
 */
export const StandaloneWithDesc = {
  render: () => ({
    components: { CheckRadio },
    template: `<div style="padding:12px"><CheckRadio value="a" label="示例选项（含描述）" description="示例描述：用于展示如何在选项下方显示补充信息或使用说明。"/></div>`,
  }),
  name: "独立：带描述",
};

/**
 * 分组示例 — 未选择
 *
 * @remarks
 * 使用 `CheckRadioGroup` 展示一组选项且初始未选择，便于测试 v-model 绑定与初始渲染行为。
 */
export const GroupUnselected = {
  render: () => ({
    components: { CheckRadio, CheckRadioGroup },
    template: `<CheckRadioGroup v-model="v" :options="opts" :correctValue="'b'" />`,
    data() {
      return {
        v: null,
        opts: [
          { value: "a", label: "选项 A" },
          { value: "b", label: "选项 B" },
          { value: "c", label: "选项 C" },
          { value: "d", label: "选项 D" },
        ],
      };
    },
  }),
  name: "分组：未选择",
};

/**
 * 分组示例 — 带描述
 *
 * @remarks
 * 展示 `CheckRadioGroup` 中各选项的 `description` 字段如何呈现，适用于显示附加说明的场景。
 */
export const GroupWithDesc = {
  render: () => ({
    components: { CheckRadio, CheckRadioGroup },
    template: `<CheckRadioGroup v-model="v" :options="opts" :correctValue="'b'" />`,
    data() {
      return {
        v: null,
        opts: [
          { value: "a", label: "选项 A", description: "A 的补充描述" },
          { value: "b", label: "选项 B", description: "B 是正确答案的说明" },
          { value: "c", label: "选项 C", description: "C 的附加信息" },
          { value: "d", label: "选项 D", description: "D 的简短提示" },
        ],
      };
    },
  }),
  name: "分组：带描述",
};

/**
 * 分组示例 — 已选（正确）
 *
 * @remarks
 * 展示 `CheckRadioGroup` 在已选且所选为正确答案时的展示效果，便于确认正确项样式渲染。
 */
export const GroupSelectedCorrect = {
  render: () => ({
    components: { CheckRadio, CheckRadioGroup },
    template: `<CheckRadioGroup v-model="v" :options="opts" :correctValue="'b'" />`,
    data() {
      return {
        v: "b",
        opts: [
          { value: "a", label: "选项 A" },
          { value: "b", label: "选项 B" },
          { value: "c", label: "选项 C" },
          { value: "d", label: "选项 D" },
        ],
      };
    },
  }),
  name: "分组：已选（正确）",
};

/**
 * 分组示例 — 已选（错误）
 *
 * @remarks
 * 展示 `CheckRadioGroup` 在已选且所选不是正确答案时的渲染效果，便于确认错误项的样式展示。
 */
export const GroupSelectedIncorrect = {
  render: () => ({
    components: { CheckRadio, CheckRadioGroup },
    template: `<CheckRadioGroup v-model="v" :options="opts" :correctValue="'b'" />`,
    data() {
      return {
        v: "a",
        opts: [
          { value: "a", label: "选项 A" },
          { value: "b", label: "选项 B" },
          { value: "c", label: "选项 C" },
          { value: "d", label: "选项 D" },
        ],
      };
    },
  }),
  name: "分组：已选（错误）",
};
