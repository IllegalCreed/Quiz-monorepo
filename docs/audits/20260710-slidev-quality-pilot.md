# Slidev M1 教学质量样板记录

> 日期：2026-07-10
> 范围：`typescript-slide`、`json-slide`、`threejs-slide`
> 结论：M1 样板门禁通过；未部署生产环境。

## 结果

| 套件       | 页数变化 | 自动分数 | 等级变化 | 原风险数 | 当前风险数 |
| ---------- | -------: | -------: | -------- | -------: | ---------: |
| TypeScript |  23 → 16 |  56 → 82 | D → B    |        4 |          0 |
| JSON       |  21 → 14 |  60 → 81 | C → B    |        5 |          0 |
| Three.js   |  18 → 16 |  59 → 84 | D → B    |        4 |          0 |

自动分数只用于批次排序。审计器暂不识别 CSS/HTML 图解和真实 WebGL 画布，因此人工验收仍是样板结论的主要依据。

## 样板能力

- TypeScript：推断、窄化、可辨识联合、泛型、类型变换和运行时边界形成连续教学路径；交互组件可切换字符串、数字与 `null`，展示 JavaScript 事实和 TypeScript 控制流结果。
- JSON：实时编辑与解析合法输入，展示语法错误位置，并用大整数样例直观看到 JavaScript `Number` 的静默精度损失。
- Three.js：实际引入 `three@0.185.1`，提供 OrbitControls、动画暂停、速度、粗糙度、主光、颜色和线框控制，并显示真实 draw call 与三角形数量。
- 三套均使用分步代码、magic-move、对比表、流程图、决策页和逐页讲者注释，不再由连续列表主导。

## 机器门禁

以下命令均成功：

```bash
pnpm -C packages/typescript-slide run build
pnpm -C packages/json-slide run build
pnpm -C packages/threejs-slide run build

node scripts/check-slidev-overflow.mjs typescript-slide
node scripts/check-slidev-overflow.mjs json-slide
node scripts/check-slidev-overflow.mjs threejs-slide
```

结果：TypeScript 16/16、JSON 14/14、Three.js 16/16，全部 0 溢出。

## 浏览器验收

- 设计视口 `980×552`：封面、概览、关键内容页与交互实验均无裁切和重叠。
- 移动视口 `390×844`：页面等比缩放，`scrollWidth = 390`，内容与底部导航无重叠。
- TypeScript：选择 `null` 后显示 `typeof → object`，随后由 `value === null` 安全窄化。
- JSON：尾逗号输入触发带行列位置的 `SyntaxError`；`9007199254740993` 解析后显示为 `9007199254740992` 并给出精度警告。
- Three.js：实景统计为 3 draw calls、20,224 triangles；线框切换可用。Canvas 裁剪区域为 `868×315`，首帧亮度范围 `0–255`、平均亮度约 `37.20`，证明画布非空；两个动画姿态的像素差平均亮度约 `7.72`，证明动画真实推进。

## 后续约束

1. Slidev Markdown 不使用通用 Prettier 格式化，避免破坏页级 frontmatter。
2. 跨页样式放在套件的 `styles/index.css`；Markdown 内 `<style>` 默认只作用于当前页。
3. 每套先确定教学路径，再按主题选择代码演进、关系图、表格或真实交互，不机械套用固定控件。
4. 组件交互必须验证状态变化；WebGL/Canvas 主题还要检查非空像素和动画帧差。
5. 每个改动套件必须依次通过 build、overflow 0 和浏览器关键页验收。

本批没有 Quiz 内容变化、prod 导入、rsync 或线上部署。
