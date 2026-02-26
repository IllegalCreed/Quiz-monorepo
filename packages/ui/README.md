# @quiz/ui

Quiz 项目共享 UI 组件库。

**技术栈**：Vue 3 + TypeScript + UnoCSS + SCSS + Storybook
**端口**：Storybook 开发服务器 `10030`

---

## 组件

| 组件              | 说明                                                      |
| ----------------- | --------------------------------------------------------- |
| `CheckRadio`      | 单选题选项（支持 default / correct / incorrect 三种状态） |
| `CheckRadioGroup` | 选项组，管理多个 CheckRadio 的状态                        |

---

## 快速开始

```bash
# 在 monorepo 根目录安装依赖
pnpm install

# 启动 Storybook（开发与交互验证）
pnpm --filter @quiz/ui run storybook

# 或在当前目录
pnpm storybook
```

---

## 常用命令

```bash
pnpm storybook         # 启动 Storybook (port 10030)
pnpm build             # 构建组件包 + 类型声明
pnpm test              # 单元测试 (Vitest, ~85 tests)
pnpm type-check        # TypeScript 类型检查
pnpm lint              # ESLint 检查
pnpm format            # Prettier 格式化
```

---

## 在 quiz-app 中使用

组件库通过 pnpm workspace 引用，无需发布。`quiz-app` 的 `uno.config.ts` 中需扫描 UI 源码以生成正确的原子类：

```ts
// apps/quiz-app/uno.config.ts
filesystem: ["../../packages/ui/src/**/*.vue"];
```

动态图标类（如 `i-carbon-*`）需加入 `quiz-app` 的 safelist，不在 UI 库中配置。

---

## 开发约定

- 新增组件同时添加 `*.stories.ts` 和单元测试
- Story 中编写可交互 cases（Controls / Actions）
- 提交前运行 `pnpm type-check && pnpm test`
