-- 扩展 quiz 内容文本字段长度：191 → 500
-- 背景：Prisma 给 MySQL 的 String 默认映射 VARCHAR(191)（utf8mb4 历史索引上限），
-- 对答题解析 explanation / 选项说明 description 等内容字段过小，易触发 P2000 LengthMismatch。
-- 这些字段均未建索引，加宽安全。带唯一索引的 admin 字段（username/name 等）保持默认不动。
ALTER TABLE `Question` MODIFY `stem` VARCHAR(500) NOT NULL;
ALTER TABLE `Question` MODIFY `explanation` VARCHAR(500) NULL;
ALTER TABLE `Option` MODIFY `text` VARCHAR(500) NOT NULL;
ALTER TABLE `Option` MODIFY `description` VARCHAR(500) NULL;
