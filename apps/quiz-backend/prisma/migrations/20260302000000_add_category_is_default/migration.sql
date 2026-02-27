-- AlterTable: 为 Category 表添加 isDefault 字段
-- 标记通识节点（不可编辑/删除/改名，sort 永远最后）
ALTER TABLE `Category` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;
