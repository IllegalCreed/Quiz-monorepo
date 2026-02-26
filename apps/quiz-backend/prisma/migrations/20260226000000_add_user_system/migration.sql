-- Quiz App 用户系统迁移
-- 新增 User、UserPreference 模型
-- 修改 AnswerAttempt 增加 userId 字段及 Question 外键

-- ============================================
-- 创建用户表
-- ============================================

CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 创建用户偏好分类表
-- ============================================

CREATE TABLE `UserPreference` (
    `userId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    INDEX `UserPreference_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`userId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 添加 UserPreference 外键约束
-- ============================================

ALTER TABLE `UserPreference`
    ADD CONSTRAINT `UserPreference_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `UserPreference`
    ADD CONSTRAINT `UserPreference_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 修改 AnswerAttempt 表：添加 userId 字段 + Question 外键
-- ============================================

ALTER TABLE `AnswerAttempt`
    ADD COLUMN `userId` INTEGER NULL;

ALTER TABLE `AnswerAttempt`
    ADD INDEX `AnswerAttempt_userId_idx`(`userId`),
    ADD INDEX `AnswerAttempt_questionId_idx`(`questionId`);

ALTER TABLE `AnswerAttempt`
    ADD CONSTRAINT `AnswerAttempt_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AnswerAttempt`
    ADD CONSTRAINT `AnswerAttempt_questionId_fkey`
    FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
