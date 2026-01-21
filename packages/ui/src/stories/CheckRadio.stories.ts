import CheckRadio from "../components/CheckRadio.vue";

export default {
  title: "组件/单选/CheckRadio",
  component: CheckRadio,
  parameters: {
    docs: {
      description: {
        component:
          "CheckRadio — 哑组件，用于展示单个选项的 label/description/status/disabled，点击时发出 select 事件。",
      },
    },
  },
  argTypes: {
    value: { description: "选项的唯一标识值（必填）" },
    label: { description: "用于显示的主标签文本" },
    description: { description: "可选的描述文本，显示在标签下方" },
    disabled: { description: "是否禁用当前选项" },
    status: { description: "展示状态：'none' | 'correct' | 'incorrect'" },
  },
};

export const StandaloneUnselected = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadio },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadio v-bind="args" /></div>`,
  }),
  args: { value: "a", label: "示例选项 A", status: "none" },
  name: "独立：未选择",
};

export const StandaloneCorrect = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadio },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadio v-bind="args" /></div>`,
  }),
  args: { value: "a", label: "正确选项", status: "correct" },
  name: "独立：正确",
};

export const StandaloneIncorrect = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadio },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadio v-bind="args" /></div>`,
  }),
  args: { value: "a", label: "错误选项", status: "incorrect" },
  name: "独立：错误",
};

export const StandaloneWithDesc = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadio },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadio v-bind="args" /></div>`,
  }),
  args: {
    value: "a",
    label: "示例选项（含描述）",
    description: "示例描述：用于展示如何在选项下方显示补充信息或使用说明。",
  },
  name: "独立：带描述",
};
