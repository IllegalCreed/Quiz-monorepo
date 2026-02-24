-- 为 Question 表添加 type 字段（题目类型，默认单选）
ALTER TABLE `Question`
  ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'single_choice' AFTER `stem`;

-- 为 Question 表添加 deletedAt 字段（软删除时间戳，null 表示未删除）
ALTER TABLE `Question`
  ADD COLUMN `deletedAt` DATETIME(3) NULL AFTER `tags`;

-- 添加 deletedAt 索引（提升软删除过滤查询性能）
CREATE INDEX `Question_deletedAt_idx` ON `Question`(`deletedAt`);
