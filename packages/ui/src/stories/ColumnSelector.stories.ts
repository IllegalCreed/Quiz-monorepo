/**
 * ColumnSelector 组件 Storybook 故事
 *
 * 每个 story 附带 play 交互测试
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";
import { ref } from "vue";
import ColumnSelector from "../components/ColumnSelector.vue";

/** 示例树形数据（模拟分类维度） */
const sampleData = [
  {
    id: "frontend",
    label: "前端",
    children: [
      {
        id: "framework",
        label: "框架",
        children: [
          { id: "vue", label: "Vue" },
          { id: "react", label: "React" },
          { id: "angular", label: "Angular" },
        ],
      },
      {
        id: "toolchain",
        label: "工具链",
        children: [
          { id: "vite", label: "Vite" },
          { id: "webpack", label: "Webpack" },
        ],
      },
      { id: "css", label: "CSS" },
    ],
  },
  {
    id: "backend",
    label: "后端",
    children: [
      { id: "nodejs", label: "Node.js" },
      { id: "nestjs", label: "NestJS" },
      { id: "python", label: "Python" },
    ],
  },
  { id: "devops", label: "DevOps" },
];

const meta = {
  title: "组件/ColumnSelector",
  component: ColumnSelector,
  parameters: {
    docs: {
      description: {
        component:
          "Miller Columns 分栏选择器，macOS Finder 风格。支持三态选中、搜索过滤、已选摘要。输入 TreeNode[] 数据，输出选中叶子 ID 数组。",
      },
    },
  },
  decorators: [
    () => ({
      template: '<div style="padding: 24px; max-width: 640px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof ColumnSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 基础用法 */
export const Default: Story = {
  args: { data: sampleData },
  render: () => ({
    components: { ColumnSelector },
    setup() {
      const selected = ref<(string | number)[]>([]);
      return { selected, sampleData };
    },
    template: `
      <div>
        <ColumnSelector v-model="selected" :data="sampleData" />
        <p style="margin-top: 12px; font-size: 14px; color: var(--quiz-ui-muted);">
          已选 ID: {{ selected }}
        </p>
      </div>
    `,
  }),
  name: "基础用法",
  play: async ({ canvas, userEvent }) => {
    /* 验证根节点渲染 */
    expect(canvas.getByText("前端")).toBeInTheDocument();
    expect(canvas.getByText("后端")).toBeInTheDocument();
    expect(canvas.getByText("DevOps")).toBeInTheDocument();
    /* 点击展开前端 → 显示子列 */
    await userEvent.click(canvas.getByText("前端"));
    expect(canvas.getByText("框架")).toBeInTheDocument();
    expect(canvas.getByText("CSS")).toBeInTheDocument();
  },
};

/** 预选值 */
export const WithPreselection: Story = {
  args: { data: sampleData },
  render: () => ({
    components: { ColumnSelector },
    setup() {
      const selected = ref(["vue", "react", "nodejs"]);
      return { selected, sampleData };
    },
    template: `
      <ColumnSelector v-model="selected" :data="sampleData" />
    `,
  }),
  name: "预选值",
  play: async ({ canvas }) => {
    /* 验证已选摘要标签渲染 */
    expect(canvas.getByText("Vue")).toBeInTheDocument();
    expect(canvas.getByText("React")).toBeInTheDocument();
    expect(canvas.getByText("Node.js")).toBeInTheDocument();
  },
};

/** 无搜索框 */
export const NoSearch: Story = {
  args: { data: sampleData },
  render: () => ({
    components: { ColumnSelector },
    setup() {
      const selected = ref<(string | number)[]>([]);
      return { selected, sampleData };
    },
    template: `
      <ColumnSelector v-model="selected" :data="sampleData" :searchable="false" />
    `,
  }),
  name: "无搜索框",
  play: async ({ canvas }) => {
    /* 验证搜索框不存在 */
    const searchInput = canvas.queryByPlaceholderText("搜索...");
    expect(searchInput).toBeNull();
    /* 节点仍然正常渲染 */
    expect(canvas.getByText("前端")).toBeInTheDocument();
  },
};

/** 扁平数据（无层级） */
export const FlatData: Story = {
  args: { data: sampleData },
  render: () => ({
    components: { ColumnSelector },
    setup() {
      const selected = ref<(string | number)[]>([]);
      const flatData = [
        { id: 1, label: "入门" },
        { id: 2, label: "初级" },
        { id: 3, label: "中级" },
        { id: 4, label: "高级" },
      ];
      return { selected, flatData };
    },
    template: `
      <ColumnSelector v-model="selected" :data="flatData" search-placeholder="搜索难度..." />
    `,
  }),
  name: "扁平数据",
  play: async ({ canvas, userEvent }) => {
    /* 验证扁平节点渲染，无箭头 */
    expect(canvas.getByText("入门")).toBeInTheDocument();
    expect(canvas.getByText("高级")).toBeInTheDocument();
    /* 搜索框使用自定义 placeholder */
    const search = canvas.getByPlaceholderText("搜索难度...");
    expect(search).toBeInTheDocument();
    /* 测试搜索过滤 */
    await userEvent.type(search, "高");
    expect(canvas.getByText("高级")).toBeInTheDocument();
    expect(canvas.queryByText("入门")).toBeNull();
  },
};
