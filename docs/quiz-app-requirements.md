# Quiz App 产品需求文档

本文档描述 Quiz App（答题应用）的整体功能设计与交互规则。

---

## 1. 产品定位

Quiz App 是一个面向开发者的知识问答应用，帮助用户通过答题巩固技术知识。题目覆盖 JavaScript、数据库、网络协议、算法等领域。

## 2. 核心流程

### 2.1 答题流程

```
加载题目 → 展示题干和选项 → 用户选择 → 提交判定 → 展示解析 → 下一题
```

1. 页面加载时自动获取一道随机题目
2. 展示题干（stem）和所有选项（options）
3. 用户点击一个选项即提交答案（单次选择，不可更改）
4. 后端返回判定结果，前端展示对错状态和选项解析
5. 根据对错决定跳转方式，进入下一题

### 2.2 答对行为

- 所选选项高亮为**绿色**（correct 状态）
- 展示所有选项的**解析描述**（description），显示在选项文本下方
- **1 秒后自动跳转**到下一道题
- "下一题"按钮**不显示**（因为会自动跳转）

### 2.3 答错行为

- 所选选项高亮为**红色**（incorrect 状态）
- 正确选项高亮为**绿色**
- 展示所有选项的**解析描述**（description），显示在选项文本下方
- **不自动跳转**，用户需手动点击"下一题"按钮
- "下一题"按钮**可见**

### 2.4 选项解析描述

每个选项附带一段解析描述（description），解释该选项为什么正确或错误。

- **答题前**：仅显示选项文本，**不显示**解析描述
- **答题后**：所有选项的解析描述同时出现，帮助用户理解每个选项的含义

## 3. 数据模型

### 3.1 题目（Question）

| 字段        | 类型     | 说明                      |
| ----------- | -------- | ------------------------- |
| id          | Int      | 主键                      |
| stem        | String   | 题干文本                  |
| explanation | String?  | 题目整体解析（可选）      |
| tags        | Json?    | 标签数组（如 javascript） |
| options     | Option[] | 关联的选项列表            |

### 3.2 选项（Option）

| 字段        | 类型    | 说明                       |
| ----------- | ------- | -------------------------- |
| id          | Int     | 主键                       |
| questionId  | Int     | 所属题目 ID                |
| text        | String  | 选项文本                   |
| isCorrect   | Boolean | 是否为正确答案             |
| description | String? | 选项解析描述（答题后展示） |

## 4. API 接口

### 4.1 获取题目

```
GET /api/questions?limit=1
```

响应示例：

```json
[
  {
    "id": 1,
    "stem": "HTTP/2 的主要优点是什么？",
    "explanation": "HTTP/2 支持多路复用，减少延迟并提高并发性能。",
    "tags": ["网络", "协议"],
    "options": [
      {
        "id": 1,
        "text": "增加握手次数",
        "description": "HTTP/2 实际上减少了握手开销..."
      },
      {
        "id": 2,
        "text": "支持多路复用和头部压缩",
        "description": "多路复用允许在一个 TCP 连接上..."
      },
      {
        "id": 3,
        "text": "只支持明文传输",
        "description": "HTTP/2 在实践中几乎都通过 TLS 加密传输..."
      }
    ]
  }
]
```

> 注意：`isCorrect` 不在此接口返回，防止客户端作弊。

### 4.2 提交答案

```
POST /api/answers
Content-Type: application/json

{ "questionId": 1, "selectedOptionId": 2, "elapsedMs": 5000 }
```

响应示例：

```json
{
  "correct": true,
  "correctOptionId": 2,
  "explanation": "HTTP/2 支持多路复用，减少延迟并提高并发性能。",
  "options": [
    {
      "id": 1,
      "text": "增加握手次数",
      "description": "...",
      "isCorrect": false
    },
    {
      "id": 2,
      "text": "支持多路复用和头部压缩",
      "description": "...",
      "isCorrect": true
    },
    {
      "id": 3,
      "text": "只支持明文传输",
      "description": "...",
      "isCorrect": false
    }
  ]
}
```

## 5. UI 组件

### 5.1 CheckRadio / CheckRadioGroup

答题选项使用共享 UI 库的 `CheckRadioGroup` 组件渲染：

- 支持 `label`（选项文本）和 `description`（解析描述）
- 支持 `status` 状态：`none` / `correct`（绿色）/ `incorrect`（红色）
- 支持 `disabled` 状态：答题后禁用交互
- 支持键盘导航（方向键切换焦点，Space/Enter 选择）

### 5.2 答题页（QuizPage）

- 加载状态："加载中…"
- 空状态："暂无题目"
- 错误状态：红色背景提示
- 正常状态：题干 + 选项组 + 条件按钮

## 6. Mock 模式

应用支持 Mock 模式（`VITE_MOCK=true`），无需后端即可测试前端交互：

- 使用硬编码的模拟题目数据（含 description）
- 第一个选项为正确答案
- 模拟答对/答错的完整流程
