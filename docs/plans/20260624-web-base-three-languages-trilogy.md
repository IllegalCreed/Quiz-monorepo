# Web 基础知识 ·「三大语言」（HTML / CSS / JavaScript）章节 — 内容生产 spec

> **性质**：`Web基础知识 > 三大语言` 开篇章，**全套三件套**（VitePress 笔记 + Slidev 幻灯片 + Quiz 题库）。与以往「一具名工具 = 一叶子」不同，三大语言每个都是**庞大语言领域**，本章把它们各拆成若干**聚焦子叶子**，每个子叶子 = 一套完整三件套。
> **落点**：笔记 `IllegalCreedWebsite/src/zh/base/language/{html,css,javascript}/`；幻灯片 `SlideStack/packages/{leaf-slug}-slide/`；题库 `apps/quiz-backend/prisma/content/{leaf-slug}.json`；分类 `apps/quiz-backend/prisma/content/categories.ts` 的 `三大语言` 节点。
> **规模**：HTML 7 叶 + CSS 10 叶 + JS 9 叶 = **26 叶**（比整个「前端测试」章 19 叶还大，预计 6~10 个工作会话产出）。
> **状态**：2026-06-24 brainstorming 完成，用户逐项拍板（① 拆聚焦子叶子 ② CSS 含独立排版叶 = 10 叶 ③ DOM/事件留 JS 章 = JS 9 叶 ④ 现在锁全量结构、按 HTML→CSS→JS 逐叶产出）。本轮叶子集合经 MDN / web.dev / javascript.info / WHATWG / CSS WG / ECMA-262 / caniuse 调研产出，已核到 2026-06 最新标准状态。待用户审 spec → 落结构 → 逐叶产出。

---

## 一、核心决策（已拍板）

1. **粒度 = 拆聚焦子叶子**。HTML/CSS/JS 各从「单叶子」升级为**父节点**，下挂聚焦子叶子。理由：整套生产模型（6~8 页笔记 / 不溢出幻灯片 / 聚焦题库）建立在「一叶子 = 一聚焦小主题」之上；单个「JavaScript」叶子无法在该体量内讲透。本章内部其余结构（计算机网络基础、浏览器基础）本就按概念拆子叶子，拆分与之一致。
2. **现在是零成本重构窗口**。三大语言尚无任何题目入库，此刻改 `categories.ts` / sidebar 为父子结构**不触发「分类移动坑」**（无需手动 update prod parentId）。`import-content.ts` 幂等只增不删，后续逐叶导入安全。
3. **叶子名带语言前缀**（如「JavaScript 闭包与作用域」「CSS Flexbox 布局」「HTML 表单与约束校验」）。硬约束来源：`import-content.ts:182-189` 按 `categoryIndex[groupName][leafName]` 定位，**叶子名必须在「技术方向」组内唯一**；前缀同时天然满足「每道 stem 含技术名前缀」规范。
4. **CSS = 10 叶（含独立排版叶）**；**JS = 9 叶（DOM/事件留 JS 章）**。
5. **先锁全量 26 叶结构入库 + sidebar，再按 HTML→CSS→JS 逐叶产出三件套**。结构一次定稳，产出可随时暂停续做。

---

## 二、完整叶子清单（26 叶，可直接开做粒度）

> 每叶给出：sort / 范围（覆盖·不覆盖）/ 5~6 个 guide-line 深度页主题 / 关键权威源。
> slug 命名建议：HTML `html-*`、CSS `css-*`、JS `js-*`，三处（笔记目录 / 幻灯片包 / 题库 JSON）统一。

### HTML（7 叶 · `三大语言 > HTML` 子树）

#### H1 ·「HTML 文档结构与元数据」 sort 1 · slug `html-document-metadata`

- **范围**：DOCTYPE / html·head·body 骨架 / charset / viewport / `<title>`·meta description / SEO·社交元数据（OG·Twitter Card·robots·canonical·theme-color）/ `<base>` / `<link rel>`（stylesheet·icon·canonical·alternate·preload·preconnect）/ PWA manifest / quirks vs standards mode。**不覆盖**：CSP 细节（→ 浏览器安全）、可见正文元素。
- **深度页**：① 文档骨架与 DOCTYPE·渲染模式 ② charset 与 viewport ③ `<title>` 与 SEO meta ④ 社交分享元数据 OG/Twitter Card ⑤ `<link>` 关系全谱 ⑥ `<head>` 资源提示（preload/preconnect/prefetch/modulepreload）
- **源**：web.dev/learn/html/document-structure · /metadata；html.spec.whatwg.org（Document metadata）；MDN Elements/meta

#### H2 ·「HTML 语义化与文档大纲」 sort 2 · slug `html-semantics`

- **范围**：语义化理念 / 分区元素（header·nav·main·article·section·aside·footer·search·address）/ 标题层级 h1–h6·文档大纲 / hgroup / 分组内容（p·blockquote·figure·figcaption·hr·pre）/ div 作为最后手段。**不覆盖**：列表与行内语义（→ H3）、ARIA roles（→ H7 带语言层基础）。
- **深度页**：① 为什么语义化（a11y/SEO/可维护性）② 分区元素与页面骨架 ③ article vs section 判定 ④ 标题层级与大纲算法演进（含已废弃 outline 算法作避坑史料）⑤ search/address/hgroup 等易错语义 ⑥ 分组内容
- **源**：web.dev/learn/html/semantic-html · /headings-and-sections；html.spec.whatwg.org/sections；MDN article

#### H3 ·「HTML 文本内容与超链接」 sort 3 · slug `html-text-links`

- **范围**：行内文本语义全集（strong·em·b·i·mark·code·kbd·abbr·cite·q·time·data·sub·sup·ruby·bdi·bdo·wbr·br·span）/ `<a>`（href 类型·锚点·mailto·tel·download·rel=noopener/noreferrer·target）/ ins·del / 列表（ul·ol·dl·menu，含 start·type·reversed）。**不覆盖**：导航语义（已在 H2）、链接预加载（已在 H1）。
- **深度页**：① 强调与重要性（strong/em/b/i 辨析）② 行内语义全谱 ③ 超链接机制与 rel 安全 ④ 列表三型 ⑤ 国际化文本 ruby/bdi/bdo + ins/del ⑥ wbr/br 与空白折叠
- **源**：web.dev/learn/html/text-basics · /links；html.spec.whatwg.org/text-level-semantics；MDN a

#### H4 ·「HTML 表单与约束校验」 sort 4 · slug `html-forms`

- **范围**：form（action·method·enctype）/ input 全类型 / label·fieldset·legend / select·option·optgroup·datalist·textarea / button / output·meter·progress / 约束校验（required·pattern·min-max·step·Constraint Validation API·`:valid`）/ autofill（autocomplete 字段名）/ inputmode·enterkeyhint / 文件上传·capture。**不覆盖**：JS 表单库（VeeValidate/Zod 等独立叶）、纯 CSS 表单美化（→ CSS 章）。
- **深度页**：① form 提交机制（GET vs POST·enctype）② input 类型全谱 ③ label/fieldset/legend 可访问关联 ④ 选择类控件 ⑤ 内置约束校验与 Constraint Validation API ⑥ autofill·inputmode·移动端体验
- **源**：web.dev/learn/html/forms；html.spec.whatwg.org/forms · /input；MDN Constraint_validation

#### H5 ·「HTML 图片与多媒体」 sort 5 · slug `html-media`

- **范围**：img（alt·loading=lazy·decoding·尺寸防 CLS）/ 响应式图片（srcset 宽度·密度描述符·sizes·picture·source·art direction）/ figure·figcaption / image map / audio·video（controls·preload·poster·autoplay 策略）/ track 字幕 / 嵌入 iframe·embed·object（sandbox·allow·loading）。**不覆盖**：Canvas/WebGL（独立叶）、WebRTC 媒体流（独立叶）、SVG/MathML 深度（仅带过）。
- **深度页**：① img 基础（alt/lazy/防抖动）② 响应式图片 srcset/sizes/picture ③ art direction 与格式回退 ④ audio/video 与 track 字幕 ⑤ iframe 嵌入与 sandbox/allow 安全（深度跨引「浏览器安全」）⑥ image map 与 embed/object（含 SVG/MathML 内联简介）
- **源**：web.dev/learn/html/images · /audio-video；MDN Responsive_images；html.spec.whatwg.org/embedded-content

#### H6 ·「HTML 表格」 sort 6 · slug `html-tables`

- **范围**：table·thead·tbody·tfoot·tr·td·th·caption·col·colgroup / 表头关联（scope·headers·id）/ colspan·rowspan / 表格可访问性 / 数据表 vs 布局表（反模式）。**不覆盖**：CSS 表格样式/响应式表格（→ CSS 章）、数据网格组件（→ 框架/组件库）。
- **深度页**：① 表格结构（thead/tbody/tfoot/caption）② 单元格 th/td 与 scope 表头关联 ③ colspan/rowspan 合并 ④ col/colgroup 列样式 ⑤ 表格可访问性 ⑥ 数据表 vs 布局表反模式
- **源**：web.dev/learn/html/tables；html.spec.whatwg.org/tables；MDN table

#### H7 ·「HTML 交互元素与全局属性」 sort 7 · slug `html-interactive-global`

- **范围**：原生交互元素（details·summary / dialog·showModal·`::backdrop` / popover·popovertarget / command·commandfor 调用者 API）/ 焦点管理（tabindex·autofocus·inert·焦点顺序）/ 全局属性（id·class·data-_·hidden·title·lang·dir·contenteditable·draggable·spellcheck·translate·enterkeyhint·inputmode·popover·inert）/ HTML 层 a11y（role·aria-_·ARIA in HTML 规则）。**不覆盖**：完整 ARIA 设计模式/无障碍测试工具（→ 测试章）、JS 拖放 API（→ JS 章）、Web Components（独立叶）。
- **深度页**：① details/summary 折叠 ② dialog 模态/非模态与 inert ③ popover API 与 command/commandfor ④ 焦点管理 ⑤ 全局属性精要 ⑥ HTML 层可访问性（role/aria-\* 与 ARIA in HTML 规则）
- **源**：web.dev/learn/html/focus；html.spec.whatwg.org/interactive-elements；MDN Global_attributes · Content_categories

---

### CSS（10 叶 · `三大语言 > CSS` 子树）

#### C1 ·「CSS 选择器与层叠」 sort 1 · slug `css-selectors-cascade`

- **范围**：选择器全谱（基础·属性·组合器·伪类·伪元素）/ `:has()`·`:is()`·`:where()`·`:not()` / specificity / cascade / inheritance / `@layer` / `:scope`。**不覆盖**：嵌套（→ C9）、具体属性取值。
- **深度页**：① 选择器家族 ② 伪类与伪元素（含 `:has()`/`:is()`/`:where()`）③ 特异性计算 ④ 层叠与继承（origin·`!important`·inherit/initial/unset/revert）⑤ `@layer` 级联层实战 ⑥ 选择器性能与最佳实践
- **源**：web.dev/learn/css/selectors · /specificity · /the-cascade；MDN CSS_cascade；caniuse css-cascade-layers

#### C2 ·「CSS 盒模型与尺寸」 sort 2 · slug `css-box-sizing`

- **范围**：标准盒·box-sizing / margin·border·padding / display 取值 / 外边距合并·BFC / width·height·min·max / 内在尺寸（min-content·max-content·fit-content）/ aspect-ratio / overflow。**不覆盖**：Flex/Grid（→ C4/C5）、定位（→ C3）。
- **深度页**：① 盒模型与 box-sizing ② display 全谱（block/inline/flow-root/none/contents）③ 外边距合并与 BFC ④ 尺寸与内在尺寸关键字 ⑤ aspect-ratio 与现代尺寸 ⑥ overflow 与滚动容器
- **源**：web.dev/learn/css/box-model · /sizing · /overflow；MDN CSS_box_model · CSS_box_sizing

#### C3 ·「CSS 定位与层叠上下文」 sort 3 · slug `css-positioning`

- **范围**：position（static·relative·absolute·fixed·sticky）/ inset / z-index / **stacking context** / float·clear（历史）/ **CSS Anchor Positioning**（anchor()·position-anchor·@position-try）。**不覆盖**：Flex/Grid 布局算法。
- **深度页**：① position 五取值（含 sticky 陷阱）② z-index 与层叠上下文（创建条件·面试高频）③ float/clear 与清除浮动（遗留）④ 锚点定位（2026-01 转 Baseline）⑤ 定位实战（悬浮·吸顶·tooltip）⑥ popover & dialog 与定位配合
- **源**：web.dev/learn/css/z-index · /anchor-positioning；MDN CSS_positioned_layout；caniuse anchor-positioning

#### C4 ·「CSS Flexbox 弹性布局」 sort 4 · slug `css-flexbox`

- **范围**：flex 容器·item / 主轴·交叉轴 / justify-content·align-items·align-content·align-self / flex-grow·shrink·basis·简写 / flex-wrap / order / gap。**不覆盖**：二维 Grid。
- **深度页**：① Flex 容器与轴向模型 ② 主轴对齐与分布 ③ 交叉轴对齐 ④ flex 三值与计算 ⑤ wrap/order/gap ⑥ Flexbox 实战模式（圣杯·等高·自适应导航）
- **源**：web.dev/learn/css/flexbox；MDN CSS_flexible_box_layout；W3C Flexbox L1

#### C5 ·「CSS Grid 网格布局」 sort 5 · slug `css-grid`

- **范围**：grid-template-rows·columns·areas / fr·minmax·repeat·auto-fill·auto-fit / 显式·隐式网格 / line·area 定位 / gap / 对齐 / **subgrid** / masonry（实验性提及）。**不覆盖**：一维 Flex。
- **深度页**：① 网格轨道与 fr/minmax/repeat ② 模板区域 grid-template-areas ③ 基于线与区域放置 ④ 隐式网格与自动布局（auto-fill vs auto-fit）⑤ subgrid 子网格（2026 Baseline）⑥ Grid 实战（响应式画廊·仪表盘·RAM 模式）
- **源**：web.dev/learn/css/grid；MDN CSS_grid_layout；W3C Grid L2(subgrid)；caniuse subgrid

#### C6 ·「CSS 响应式与现代查询」 sort 6 · slug `css-responsive-queries`

- **范围**：媒体查询（range 语法 `width >= 600px`·prefers-color-scheme·prefers-reduced-motion）/ **container queries**（size + style queries）/ `@supports` / logical properties / writing-mode / multi-column。**不覆盖**：具体布局算法（已在 C4/C5）。
- **深度页**：① 媒体查询与现代 range 语法 ② 用户偏好媒体特性（暗色·减弱动画·对比度）③ 容器查询（size+style，2026 Baseline）④ `@supports` 渐进增强 ⑤ 逻辑属性与书写模式（i18n）⑥ 多列布局 + 响应式综合实战
- **源**：web.dev/learn/css/container-queries · /logical-properties；MDN CSS_containment · CSS_media_queries；caniuse container-queries

#### C7 ·「CSS 颜色与背景」 sort 7 · slug `css-color-background`

- **范围**：颜色表示（hex·rgb·hsl·**oklch·lab**）/ **color-mix()** / color-scheme / 透明度 / background-\* 全属性·多背景 / border·border-radius·border-image / box-shadow / 渐变（linear·radial·conic）。**不覆盖**：滤镜/混合（→ C8）。
- **深度页**：① 颜色表示法与现代色彩空间（oklch/lab）② color-mix() 与颜色函数（2026 Baseline）③ 背景属性与多背景 ④ 边框·圆角·border-image ⑤ box-shadow 与阴影设计 ⑥ 渐变实战
- **源**：web.dev/learn/css/color · /gradients · /backgrounds；MDN CSS_colors；caniuse color-mix

#### C8 ·「CSS 过渡、动画与视觉」 sort 8 · slug `css-animation-effects`

- **范围**：transition / `@keyframes`·animation / transform（2D/3D）/ 缓动 cubic-bezier·linear() / **View Transitions** / **Scroll-driven animations** / filter·backdrop-filter / mix-blend-mode / clip-path·mask / will-change。**不覆盖**：JS 动画库。
- **深度页**：① transition ② `@keyframes` 与 animation ③ transform 2D/3D 与合成层 ④ 滤镜·混合·裁剪遮罩 ⑤ View Transitions + 滚动驱动动画（2025-2026 Baseline）⑥ 动画性能优化（合成层·will-change·reduced-motion）
- **源**：web.dev/learn/css/animations · /transitions · /filters；MDN CSS_transforms；caniuse view-transitions

#### C9 ·「CSS 自定义属性、函数与工程化」 sort 9 · slug `css-variables-engineering`

- **范围**：**Custom Properties**（`--x`·var()·作用域·JS 交互·`@property` 类型化）/ **CSS Nesting**（`&`）/ 函数（calc·clamp·min·max）/ `@scope` / 组织方法论（BEM·层叠层架构）/ 调试。**不覆盖**：Sass/Less/PostCSS（独立叶）——但讲**原生 CSS 如何替代预处理器能力**。
- **深度页**：① 自定义属性与作用域（含运行时主题切换）② `@property` 类型化变量 ③ 原生嵌套 CSS Nesting（对比 Sass）④ 数学函数 calc/clamp/min/max（流式排版）⑤ CSS 组织方法论（BEM·cascade layers·`@scope`）⑥ CSS 调试与 DevTools 工作流
- **源**：web.dev/learn/css/custom-properties · /functions · /nesting；MDN Using_CSS_custom_properties；caniuse css-nesting

#### C10 ·「CSS 文字排版与字体」 sort 10 · slug `css-typography`

- **范围**：font 属性·`@font-face`·font-display·可变字体 / line-height·letter-spacing·word-spacing / text-align·text-indent·text-decoration·text-transform / text-overflow·white-space·overflow-wrap / **text-wrap: balance/pretty** / hanging-punctuation / 列表样式·`::marker` / counter() 计数器 / web fonts 加载与性能。**不覆盖**：writing-mode（已在 C6）、文字颜色/阴影（已在 C7 带 text-shadow）。
- **深度页**：① 字体族与 @font-face·可变字体 ② 字体加载与性能（font-display·预加载·FOUT/FOIT）③ 行高·字间距·文本对齐与缩进 ④ 文本溢出与换行（text-overflow·white-space·overflow-wrap·text-wrap）⑤ 列表样式与 `::marker` ⑥ counter() 计数器与生成内容
- **源**：web.dev/learn/css/typography；MDN CSS_fonts · CSS_text；caniuse css-text-wrap-balance

---

### JavaScript（9 叶 · `三大语言 > JavaScript` 子树）

#### J1 ·「JavaScript 语言基础与类型系统」 sort 1 · slug `js-fundamentals-types`

- **范围**：变量声明（var·let·const·TDZ·提升）/ 7 原始类型 + object / 类型转换（显隐式·`==` vs `===`·truthy/falsy）/ 运算符全谱（算术·逻辑·位·三元·`?.`·`??`·`**`）/ 控制流与循环。**不覆盖**：函数（J2）、对象深入（J3）。
- **深度页**：① 变量与作用域声明（var/let/const·提升·TDZ）② 原始类型与包装对象 ③ 类型转换与相等比较（Object.is·NaN 坑）④ 运算符全谱 ⑤ 控制流与循环（for...of vs for...in·标签）⑥ strict mode 与语言怪癖（typeof null·ASI）
- **源**：MDN Grammar_and_types · Operators · Equality_comparisons；javascript.info first-steps

#### J2 ·「JavaScript 函数与作用域」 sort 2 · slug `js-functions-scope`

- **范围**：函数形态（声明·表达式·箭头·IIFE）/ 参数（默认·剩余·arguments）/ 作用域链 / **闭包** / `this` 四规则 / call·apply·bind / 高阶·柯里化·组合 / 递归·调用栈。**不覆盖**：生成器（J8）、class 中 this 细节（J4 带过）。
- **深度页**：① 函数形态与参数 ② 箭头 vs 普通函数（this/arguments/不可 new）③ 作用域链与闭包 ④ this 四规则（默认·隐式·显式·new + 丢失场景）⑤ call/apply/bind 与函数借用 ⑥ 高阶函数·柯里化·偏函数·组合
- **源**：MDN Functions · Closures；javascript.info advanced-functions · closure
- **可选加厚**（用户未选，记录备用）：可拆「闭包与作用域」+「this 与函数调用」两叶 → JS 10 叶。

#### J3 ·「JavaScript 对象与原型继承」 sort 3 · slug `js-objects-prototype`

- **范围**：对象字面量 / 属性描述符（defineProperty·getter/setter·可枚举/可写/可配置）/ Object.keys·values·entries·assign·freeze·fromEntries·hasOwn / 引用 vs 值·浅深拷贝（structuredClone·循环引用）/ **原型链**·`[[Prototype]]`·Object.create·`__proto__` vs prototype·属性遮蔽。**不覆盖**：class 语法糖（J4）、Map/Set（J6）。
- **深度页**：① 对象基础与属性访问（in·delete·计算属性）② 属性描述符与 getter/setter（freeze/seal）③ 引用语义与拷贝（浅/深·structuredClone）④ 原型链机制 ⑤ 基于原型的继承模式（寄生组合继承史）⑥ Object 静态方法与遍历
- **源**：MDN Working_with_objects · Inheritance_and_the_prototype_chain；javascript.info prototypes · property-descriptors

#### J4 ·「JavaScript 类与面向对象」 sort 4 · slug `js-classes-oop`

- **范围**：class·constructor·实例/原型方法 / extends·super / static·静态初始化块 / **私有字段 `#`** / getter·setter / instanceof·new.target / class 字段 / **装饰器现状（Stage 3，未原生，靠 TS/Babel）**。**不覆盖**：底层原型机制（J3）。
- **深度页**：① class 语法与实例化 ② 继承 extends 与 super ③ static 成员与静态初始化块 ④ 私有字段与方法（`#`·`#x in obj`）⑤ getter/setter 与 instanceof/Symbol.hasInstance ⑥ 装饰器与元编程入口（Stage 3 现状·与 TS 区别）
- **源**：MDN Using_classes · Classes；javascript.info classes；TC39 proposal-decorators

#### J5 ·「JavaScript 数组与可迭代协议」 sort 5 · slug `js-arrays-iterables`

- **范围**：数组方法全谱（增删改查·map/filter/reduce/flat·**ES2023 toSorted/toReversed/with/findLast**）/ **解构赋值**（数组·对象·默认值·嵌套）/ 扩展·剩余 `...` / **迭代协议**（Symbol.iterator·可迭代 vs 类数组·**Iterator Helpers ES2025**）/ Array.from·fromAsync。**不覆盖**：生成器（J8 讲生产侧）。
- **深度页**：① 数组基础与遍历 ② 变更 vs 不变更方法（ES2023 不可变）③ 高阶遍历（map/filter/reduce/flatMap/find）④ 解构赋值 ⑤ 扩展与剩余语法 ⑥ 可迭代协议与 Iterator Helpers
- **源**：MDN Indexed_collections · Array · Destructuring_assignment；javascript.info array-methods · destructuring-assignment

#### J6 ·「JavaScript 内建对象与数据结构」 sort 6 · slug `js-builtins-structures`

- **范围**：Number·Math·BigInt / String·模板字面量 / **正则 RegExp** / Map·Set·WeakMap·WeakSet·WeakRef / JSON.parse·stringify / Symbol·well-known symbols / Date + **Temporal（Stage 4 / ES2026，Chrome 144+·FF 139+ 已发，讲「已落地」非提案）** / Intl 概览。**不覆盖**：数组（J5）、第三方日期库（Day.js/date-fns 独立叶，本叶只讲原生）。
- **深度页**：① 数字与数学（Number·浮点·Math·BigInt）② 字符串与模板字面量（Unicode·标签模板）③ 正则表达式（g/i/m/s/u/y·捕获组·断言·matchAll·命名组）④ Map/Set/WeakMap/WeakRef（弱引用与 GC）⑤ JSON 与 Symbol ⑥ 日期时间：Date 与 Temporal（Date 坑·Temporal 现状·Intl）
- **源**：MDN Numbers_and_strings · Regular_expressions · Keyed_collections；TC39 proposal-temporal
- **可选加厚**（用户未选，记录备用）：正则可独立成「JavaScript 正则表达式」叶 → JS 10 叶。

#### J7 ·「JavaScript 异步编程」 sort 7 · slug `js-async`

- **范围**：**事件循环**（调用栈·宏/微任务·queueMicrotask·渲染时机）/ 回调与回调地狱 / **Promise**（状态机·链式·all/race/allSettled/any·错误冒泡）/ **async/await**·**顶层 await** / **AbortController·AbortSignal** / Promise.withResolvers(ES2024)。**不覆盖**：Fetch API 本体（独立叶，本叶用 fetch 举例不深挖）、Web Workers（独立叶）、RxJS（独立叶）。
- **深度页**：① 事件循环与执行模型 ② 回调与异步演进（回调地狱·控制反转）③ Promise 基础与链式 ④ Promise 组合 API + 并发控制 ⑤ async/await（本质·try/catch·顺序 vs 并行·顶层 await）⑥ 取消与超时（AbortController·withResolvers·竞态）
- **源**：MDN Using_promises · Execution_model；javascript.info async · event-loop

#### J8 ·「JavaScript 生成器与元编程」 sort 8 · slug `js-generators-metaprogramming`

- **范围**：**生成器** `function*`·yield·yield\* / 异步生成器·`for await...of` / **Proxy·Reflect**（13 trap）/ Symbol.iterator 自定义迭代 / **资源管理 `using`·`await using`（ES2026 DisposableStack）** / FinalizationRegistry·WeakRef 内存管理 / 尾调用概念。**不覆盖**：基础迭代消费协议（J5）。
- **深度页**：① 生成器函数（惰性求值·双向通信·yield\*）② 异步生成器与异步迭代（流式数据）③ 用生成器实现自定义迭代器（与 J5 呼应·无限序列）④ Proxy 与 Reflect（trap·应用：响应式/校验/默认值）⑤ 元编程与资源管理（well-known symbols 钩子·using·FinalizationRegistry）
- **源**：MDN Iterators_and_generators · Meta_programming · Proxy；javascript.info generators-iterators

#### J9 ·「JavaScript DOM 与事件」 sort 9 · slug `js-dom-events`

- **范围**：DOM 树·节点类型 / 查询 querySelector*·getElement* / 节点增删改·textContent vs innerHTML·DocumentFragment / 属性 vs 特性·classList·style·尺寸坐标 / **事件机制**（冒泡·捕获三阶段·addEventListener·event 对象·stopPropagation·preventDefault）/ **事件委托**·CustomEvent·dispatchEvent / 表单与控件事件 / 页面加载（DOMContentLoaded·load·beforeunload·defer/async 脚本时机）。**不覆盖**：具名 Web API（Fetch/Storage/Workers 等独立叶）、CSS 本身（独立章）。
- **深度页**：① DOM 树与节点遍历 ② 修改文档（创建/插入/删除·DocumentFragment）③ 属性·样式·类·尺寸坐标 ④ 事件机制（三阶段·event 对象）⑤ 事件委托与自定义事件 ⑥ 表单与页面加载（defer/async 时机）
- **源**：MDN DOM Introduction；javascript.info document · events · ui-events
- **红线**：DOM 树操作 + 事件机制（无专名、属语言基本功）归本叶；具名 Web API（Fetch/Storage/Workers/WebSocket/Web Components）归 `Web API` 组既有叶。事件**循环**归 J7（运行时模型，不依赖 DOM）；DOM **事件**归 J9（依赖 DOM）。

---

## 三、分类树改造（`apps/quiz-backend/prisma/content/categories.ts`）

当前（约 line 52-57）：

```ts
{
  name: "三大语言", sort: 1,
  children: [
    { name: "HTML", sort: 1 },
    { name: "JavaScript", sort: 2 },
    { name: "CSS", sort: 3 },
  ],
},
```

改造为（HTML/CSS/JS 各升级为带 children 的父节点，子叶 sort 见上表）：

```ts
{
  name: "三大语言", sort: 1,
  children: [
    {
      name: "HTML", sort: 1,
      children: [
        { name: "HTML 文档结构与元数据", sort: 1 },
        { name: "HTML 语义化与文档大纲", sort: 2 },
        { name: "HTML 文本内容与超链接", sort: 3 },
        { name: "HTML 表单与约束校验", sort: 4 },
        { name: "HTML 图片与多媒体", sort: 5 },
        { name: "HTML 表格", sort: 6 },
        { name: "HTML 交互元素与全局属性", sort: 7 },
      ],
    },
    {
      name: "JavaScript", sort: 2,
      children: [
        { name: "JavaScript 语言基础与类型系统", sort: 1 },
        { name: "JavaScript 函数与作用域", sort: 2 },
        { name: "JavaScript 对象与原型继承", sort: 3 },
        { name: "JavaScript 类与面向对象", sort: 4 },
        { name: "JavaScript 数组与可迭代协议", sort: 5 },
        { name: "JavaScript 内建对象与数据结构", sort: 6 },
        { name: "JavaScript 异步编程", sort: 7 },
        { name: "JavaScript 生成器与元编程", sort: 8 },
        { name: "JavaScript DOM 与事件", sort: 9 },
      ],
    },
    {
      name: "CSS", sort: 3,
      children: [
        { name: "CSS 选择器与层叠", sort: 1 },
        { name: "CSS 盒模型与尺寸", sort: 2 },
        { name: "CSS 定位与层叠上下文", sort: 3 },
        { name: "CSS Flexbox 弹性布局", sort: 4 },
        { name: "CSS Grid 网格布局", sort: 5 },
        { name: "CSS 响应式与现代查询", sort: 6 },
        { name: "CSS 颜色与背景", sort: 7 },
        { name: "CSS 过渡、动画与视觉", sort: 8 },
        { name: "CSS 自定义属性、函数与工程化", sort: 9 },
        { name: "CSS 文字排版与字体", sort: 10 },
      ],
    },
  ],
},
```

> 题库 `categories` 字段写 `["技术方向", "<子叶子名>"]`（只给组名 + 叶子名，import 按组内叶子名唯一定位）。原 `HTML/JavaScript/CSS` 由叶子变父节点后**不再是叶子**（不可挂题），符合「Quiz 只关联叶子节点」。因尚无题入库，无迁移成本。

---

## 四、sidebar 改造（`IllegalCreedWebsite/.vitepress/config.mts`）

当前 `三大语言`（约 line 138-156）下 HTML/JavaScript/CSS 为三个直链 `link`。改为：每个语言节点带 `items`，每个子叶子一条 `link: "/zh/base/language/{html|css|javascript}/{leaf-slug}/"`，`collapsed: true`。**与 `categories.ts` 叶子名逐字对齐**（项目硬约束：sidebar 文案 = 分类叶子名）。笔记目录同步建 `src/zh/base/language/{lang}/{leaf-slug}/`。

---

## 五、边界判断（刻意排除 → 归属，避免与既有叶重复）

| 排除主题                                                 | 归属                           | 依据                                      |
| -------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| Canvas / WebGL                                           | 既有「Canvas/WebGL」叶         | MDN 归 Scripting                          |
| `<template>`/`<slot>`/Shadow DOM                         | 既有「Web Components」叶       | MDN/web.dev 归 Web Components             |
| Web Storage / Workers / Fetch / WebSocket / SSE / WebRTC | 既有各「Web API」叶            | 具名 API 层                               |
| `<script>` async/defer/module/importmap 加载机制         | JS 章（J9 带脚本时机）+ 模块叶 | 运行时主题                                |
| Sass / Less / PostCSS / Tailwind / UnoCSS                | 既有「CSS 预处理」叶           | 本章只讲原生 CSS（C9 仅对比，点到为止）   |
| TypeScript                                               | 既有「TypeScript」叶           | 本章只讲 JS                               |
| 模块加载机制 / ESM vs CommonJS / 循环依赖 / tree-shaking | 既有「ES Module / CommonJS」叶 | JS 章只讲 import/export 语法基础          |
| JS 工具库（lodash·date-fns·zod·rxjs 等）                 | 既有各独立叶                   | 本章只讲语言本身                          |
| 完整 ARIA 设计模式 / 无障碍测试工具                      | 既有「可访问性测试」叶         | HTML 章保留语言层 role/aria 基础          |
| CSSOM / getComputedStyle / JS 读写 CSS 变量              | JS / Web API                   | C9 仅保留「自定义属性与 JS 交互」最小切面 |

---

## 六、信源策略（每叶下笔前执行，符合 CLAUDE.md 内容审查规范）

1. **MDN 为主**：逐页 WebFetch 该叶对应的 Guide / Reference / Learn 页（每叶上表已列起点 URL）。
2. **课程结构参考**：web.dev Learn HTML/CSS/JavaScript、javascript.info——映射深度页切分。
3. **规范背书**：WHATWG HTML Living Standard / CSS WG specs / ECMA-262——权威性与现代标准（如 popover、anchor positioning、Temporal、装饰器现状）。
4. **caniuse 核对支持度**：现代特性必须标注 Baseline 年份 / 百分比 + 降级策略（杜绝「老 CSS2 / 旧 JS」感）。
5. **context7 / zread 补充** + **本地验证**：交叉比对后再下笔；不一致以「官方网页 + 本地验证」为准。
6. **现代特性已核状态（2026-06）**：Temporal = Stage 4/ES2026（已发 Chrome 144+/FF 139+，讲已落地）；装饰器 = 仍 Stage 3（明确非原生）；锚点定位 = 2026-01 Baseline；subgrid / 容器查询 / color-mix / 原生嵌套 / `@property` = 均已 Baseline；View Transitions = 同文档 Baseline 2025（跨文档需注降级）；滚动驱动动画 = 渐进可用需降级。

---

## 七、单叶生产流程与质量门禁（每叶重复，沿用既有三件套范式）

每个子叶子 = 完整三件套，按既有流程产出（参见记忆 `content-trilogy-production-spec`）：

1. **VitePress 笔记**：`index.md`（概览：一句话定义 + 评价 + 全文地图 + 幻灯片链接）+ `getting-started.md` + `guide-line/*.md`（5~6 深度页）+ `reference.md`。
   - **门禁**：除 `index.md` 外**每个内容页** `# 标题` + `> 基于X版本` 后**紧跟 `## 速查`**（要点式浓缩本页核心 API/属性/坑/版本/链接）。漏速查 = 未完成。
   - 行内 `{{ }}`（如正则、模板字面量示例）须用 `<code v-pre>` 包裹，防 VitePress 当 Vue 插值构建崩（记忆 `vitepress-mustache-build-trap`）。
2. **Slidev 幻灯片**：`SlideStack/packages/{leaf-slug}-slide/`，约 30~60 页。
   - **门禁**：`pnpm -C packages/{leaf-slug}-slide run build` 后跑 `node scripts/check-slidev-overflow.mjs {leaf-slug}-slide`，**0 溢出**才算完成；有溢出按报告逐页精简（代码≈22px/表格行≈33px/正文≈26px）。Slidev 锁 52.15.2。
3. **Quiz 题库**：`apps/quiz-backend/prisma/content/{leaf-slug}.json`，重质不限量（约 30~120 题/叶，按深度给足）。
   - **门禁**：每题 `stem` 含技术名前缀（HTML/CSS/JavaScript）；`categories` = `["技术方向","<子叶子名>"]` 须与 categories.ts 逐字一致 + `["难度","入门|进阶|高级"]`；中文引号用**全角**（记忆 `quiz-json-fullwidth-quotes`），写完跑 `node` 自检 JSON.parse。
   - **入库**：经用户确认后 `pnpm -C apps/quiz-backend run import:content:prod`（仅生产库·幂等增量）。**绝不擅自跑 import；dev/test 库禁放正式题。**

---

## 八、推进节奏与里程碑

- **里程碑 0（先做·一次性）**：改 `categories.ts`（26 子叶子）+ `config.mts` sidebar + 建 26 个笔记目录骨架。`pnpm run check` 通过。这步**不导入题目**，只立结构。
- **里程碑 1 — HTML（7 叶）**：H1→H7 逐叶三件套。
- **里程碑 2 — CSS（10 叶）**：C1→C10 逐叶三件套。
- **里程碑 3 — JS（9 叶）**：J1→J9 逐叶三件套。
- **每叶节奏**：笔记 → 幻灯片（过溢出门禁）→ 题库（过自检）→ 报用户确认后 import:content:prod → 三仓（笔记 deploy / 幻灯片 SlideStack / 题库 RDS）部署（参见记忆 `content-deploy-workflow`）。
- 顺序内可按面试/实战重要性微调起步叶（如 HTML 先做 H4 表单 / H2 语义化，CSS 先做 C4/C5 布局，JS 先做 J2 函数闭包 / J7 异步）——待用户指定，否则默认按 sort 顺序。

---

## 九、已默认的微调（供 review，可改）

- HTML：全局属性并入 H7（不单列）；响应式图片留 H5（不独立）；iframe 基础在 H5、深度安全跨引「浏览器安全」；文档大纲废弃算法作避坑史料。
- CSS：容器查询留 C6（不并入 Grid）；定位独立 C3（不并入盒模型）；transform 跟动画 C8（不跟定位）；C9 工程化合一（变量+函数+嵌套+方法论，不再拆）。
- JS：闭包 + this 合并于 J2（未拆）；正则留 J6（未独立）；J8 命名「生成器与元编程」（迭代器消费已在 J5）；DOM 排 sort 9（语言优先，未提前）。
- 任一项想改（尤其 JS 想把闭包/正则加厚成独立叶 → JS 10 叶），开做对应语言前说一声即可，结构改动仍在零成本窗口内（该语言未导入题之前）。

---

## 十、相关记忆 / 文档

- `content-trilogy-production-spec`（三件套结构+门禁）· `content-batch-investigation-convention`（开批前选型）· `vitepress-note-cheatsheet-required`（速查强制）· `quiz-json-fullwidth-quotes`（全角引号）· `vitepress-mustache-build-trap`（`{{ }}` 坑）· `content-deploy-workflow`（部署 + 分类移动坑）· `quiz-prod-rds-connection`（生产库）。
- 同类近期 plan：`20260619-frontend-testing-trilogy.md`、`20260622-test-quality-and-misc-trilogy.md`。
