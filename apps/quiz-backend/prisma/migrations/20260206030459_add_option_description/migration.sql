-- AlterTable: 为 Option 表添加 description 字段（选项解析说明）
ALTER TABLE `Option` ADD COLUMN `description` VARCHAR(191) NULL;
