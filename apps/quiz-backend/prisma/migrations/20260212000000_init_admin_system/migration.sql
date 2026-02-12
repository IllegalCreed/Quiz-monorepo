-- Quiz Admin 管理员系统初始化迁移
-- 开发阶段完整定义（包含 DROP + CREATE）

-- ============================================
-- 删除现有表（如果存在）
-- ============================================

DROP TABLE IF EXISTS `Admin`;
DROP TABLE IF EXISTS `Role`;

-- ============================================
-- 创建角色表
-- ============================================

CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `menuPermissions` JSON NOT NULL,
    `apiPermissions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    INDEX `Role_isSystem_idx`(`isSystem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 创建管理员表
-- ============================================

CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_username_key`(`username`),
    INDEX `Admin_status_roleId_idx`(`status`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 添加外键约束
-- ============================================

ALTER TABLE `Admin` ADD CONSTRAINT `Admin_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
