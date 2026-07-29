# 20260729 数据结构和算法章节三件套方案

> 本对话产物：categories.ts 骨架 + sidebar 结构 + 可视化网站对照映射 + 本方案（含下个对话提示词）。
> **本对话不产实际三件套内容**（笔记/幻灯片/题库留到下个对话）。

## 一、背景与决策

- 数据结构和算法章 sidebar 原有 35 个占位叶子（全无内容），categories.ts 完全缺失该章。
- 用户有算法可视化网站 `/Users/zhangxu/workspace/algorithms-visualization/`（92 个算法页面，10 大类），可作为交互演示链接。
- 调研定稿：35 占位叶 → **35 叶**（含子组标题），实际叶子约 26 个概念族。删除刷题平台 5 叶（LeetCode 等归软技能），合并碎叶（冒泡+选择+插入→简单排序），新增硬伤（字符串算法 2 叶、数论扩 3 叶、高级数据结构 +3 叶）。

## 二、35 叶完整清单（categories.ts 已落地）

### 数据结构（12 叶）

**基本数据结构（5）**：数组 / 链表 / 栈 / 队列 / 哈希表
**高级数据结构（7）**：二叉树与二叉搜索树 / 堆 / 图的表示 / 前缀树（Trie）/ 并查集 / 线段树与树状数组 / 工程实用结构（LRU / 跳表 / 布隆过滤器）

### 排序（6 叶）

简单排序（冒泡 / 选择 / 插入） / 快速排序 / 归并排序 / 堆排序 / 希尔排序 / 非比较排序（计数 / 桶 / 基数）

### 搜索（2 叶）

线性查找与二分查找 / 二分查找变体（旋转数组 / 二分答案 / 三分）

### 图算法（4 叶）

图遍历（DFS / BFS）/ 最短路径算法 / 最小生成树算法 / 拓扑排序

### 高级算法（6 叶）

动态规划基础 / 序列与区间动态规划 / 进阶动态规划 / 贪心算法 / 分治算法 / 回溯算法

### 字符串算法（2 叶）

字符串匹配（KMP / Rabin-Karp / Boyer-Moore）/ 回文与 Z 函数（Manacher / Z）

### 数学与数论（5 叶）

GCD 与扩展欧几里得 / 素数筛（埃氏筛 / 线性筛）/ 快速幂与模运算 / 欧拉函数与组合数 / 位运算

## 三、可视化网站对照映射

可视化网站路径规则：`/docs/{slug}`（中文）/ `/en/docs/{slug}`（英文）

| 叶子             | 可视化 slug                                   | 可视化路径                        |
| ---------------- | --------------------------------------------- | --------------------------------- |
| 数组             | array                                         | /docs/array                       |
| 链表             | link                                          | /docs/link                        |
| 栈               | stack                                         | /docs/stack                       |
| 队列             | queue                                         | /docs/queue                       |
| 哈希表           | hash                                          | /docs/hash                        |
| 二叉树与BST      | tree                                          | /docs/tree                        |
| 堆               | heap                                          | /docs/heap                        |
| 图的表示         | graph                                         | /docs/graph                       |
| 前缀树           | trie                                          | /docs/trie                        |
| 并查集           | union-find                                    | /docs/union-find                  |
| 线段树与树状数组 | segment-tree, fenwick                         | /docs/segment-tree, /docs/fenwick |
| 工程实用结构     | lru, skip-list, bloom-filter                  | /docs/lru 等                      |
| 简单排序         | bubble-sort, selection-sort, insertion-sort   | /docs/bubble-sort 等              |
| 快速排序         | quick-sort, three-way-quick, dual-pivot-quick | /docs/quick-sort 等               |
| 归并排序         | merge-sort, top-down-merge                    | /docs/merge-sort                  |
| 堆排序           | heap-sort                                     | /docs/heap-sort                   |
| 希尔排序         | shell-sort                                    | /docs/shell-sort                  |
| 非比较排序       | counting-sort, bucket-sort, radix-sort        | /docs/counting-sort 等            |
| 线性与二分查找   | binary-search, binary-bounds                  | /docs/binary-search               |
| 二分变体         | rotated-search, binary-answer, ternary-search | /docs/rotated-search 等           |
| 图遍历 DFS/BFS   | maze, number-of-islands                       | /docs/maze                        |
| 最短路径         | dijkstra, bellman-ford, floyd-warshall        | /docs/dijkstra 等                 |
| MST              | kruskal, prim                                 | /docs/kruskal                     |
| 拓扑排序         | topological-sort                              | /docs/topological-sort            |
| DP 基础          | knapsack, complete-knapsack, coin-change      | /docs/knapsack 等                 |
| 序列区间DP       | lcs, lis, edit-distance, stone-merge          | /docs/lcs 等                      |
| 进阶DP           | tree-dp, digit-dp, reroot-dp                  | /docs/tree-dp 等                  |
| 回溯             | n-queens, subsets, permutations, sudoku       | /docs/n-queens 等                 |
| 字符串匹配       | kmp, rabin-karp, boyermoore                   | /docs/kmp 等                      |
| 回文与Z函数      | manacher, zfunc                               | /docs/manacher                    |
| GCD              | gcd, extgcd                                   | /docs/gcd                         |
| 素数筛           | sieve-of-eratosthenes, linearsieve            | /docs/sieve-of-eratosthenes       |
| 快速幂           | fastpower                                     | /docs/fastpower                   |
| 欧拉函数         | euler-phi (phi)                               | /docs/phi                         |

> 无可视化页面的叶子（贪心/分治/位运算/欧拉函数与组合数）：笔记不外链可视化，靠自身图解。

## 四、已完成（本对话）

- categories.ts：新增「数据结构和算法」章（sort=22），软技能 sort 22→23
- sidebar：重构为新 35 叶结构，删除旧 35 叶+刷题平台
- 两仓库已提交

## 五、下个对话提示词（复制以下内容到新对话）

````
继续数据结构和算法章节三件套的实际制作。方案文档：docs/plans/20260729-data-structures-algorithms-trilogy.md（含 35 叶清单+可视化网站映射+边界，务必先读）。

【任务】按"笔记 → 幻灯片 → 题库"顺序，产出数据结构和算法章节 35 叶三件套。

【已完成（上一对话）】
- categories.ts：新增「数据结构和算法」章 sort=22，35 叶定稿已落地
- sidebar：重构为新 35 叶结构，旧 35 叶+刷题平台已删除
- 软技能 sort 调整 22→23

【产出顺序（强制）】
1. 笔记（VitePress）：每叶 index.md + getting-started.md + guide-line/*.md + reference.md；
   除 index 外每页 # 标题 + > 基于X版本 后紧跟 ## 速查。
2. 幻灯片（Slidev）：cp -r 脚手架，改 name + build --base，参照 prettier-slide 防溢出；
   build 后跑 check-slidev-overflow.mjs，0 溢出才算完成。
3. 题库（quiz JSON）：每叶 20+ 题，stem 含技术名前缀、4 选 1 每项含 description、
   categories 叶子名与 categories.ts 完全一致（含全角括号）、中文引号全角。

【笔记目录结构】
笔记根目录：`/Users/zhangxu/workspace/IllegalCreedWebsite/src/zh/dsa/`
子组目录：
- data-structures/basic/{array,linked-list,stack,queue,hash-table}/
- data-structures/advanced/{binary-tree,heap,graph-representation,trie,union-find,segment-tree,utility-structures}/
- sorting/{simple-sort,quick-sort,merge-sort,heap-sort,shell-sort,non-comparison-sort}/
- searching/{linear-binary-search,binary-search-variants}/
- graph/{dfs-bfs,shortest-path,mst,topological-sort}/
- advanced-algorithms/{dp-basics,dp-sequence-interval,dp-advanced,greedy,divide-conquer,backtracking}/
- strings/{string-matching,palindrome-z-function}/
- math/{gcd,prime-sieve,fast-power,euler-function,bit-manipulation}/

【可视化网站链接（重要特色）】
每个叶子的 guide-line.md 或 reference.md 中，在对应算法处加「交互演示」外链区块：
```markdown
## 交互演示

<a href="https://algo.illegalscreed.cn/docs/quick-sort" target="_blank">快速排序可视化演示</a>
````

可视化网站 slug 对照见方案文档第三节。笔记讲概念+考点+复杂度分析，可视化做交互演示，不重复造轮子。
可视化网站域名待确认（可能是 algo.illegalscreed.cn 或其他）。

【分批策略（节流）】按子组分批，每批 ≤3 路并行。
建议：①数据结构·基本5 → ②数据结构·高级7 → ③排序6+搜索2 → ④图算法4+高级算法6
→ ⑤字符串2+数学数论5。每批先精做1叶标杆→其余并行→验门禁。

【关键边界】

- 「图的表示」叶讲数据结构（邻接矩阵/邻接表），图算法叶讲算法（DFS/BFS/Dijkstra）
- 「堆」叶讲数据结构，「堆排序」叶讲排序算法
- DP 三叶递进：基础（背包/零钱）→ 序列区间（LCS/LIS/编辑距离）→ 进阶（树DP/数位DP/换根DP）
- 位运算并入数学与数论（不再独立成组）

【deprecation/边界】

- 刷题平台（LeetCode/HackerRank/CodeSignal/ACM/VisuAlgo）已从本章删除
- 竞赛级冷门算法（Pollard-Rho/FFT/2-SAT/计算几何）不立叶

【每批只 build 一次 VitePress】产出+扫崩点→提交 quiz/slide→import 拿 ID→
回填源 md→build 一次→提交部署。

【import 生产库】见 AGENTS.md「题目入库规范」。执行前必须经用户确认。

```

```
