# 内容审计产物

本目录保存三仓库内容工程的可重复生成审计结果。

- `content-node-registry.json`：以 VitePress 技术节点为主键的三仓库统一登记表。
- `20260710-content-audit-baseline.md`：M0 基线摘要、跨仓库缺口和后续优先级。

生成命令：

```bash
pnpm run content:audit
```

该命令只读取本地文件，不连接数据库、不执行导入或部署。
