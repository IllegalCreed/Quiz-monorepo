-- CreateTable: 系统操作日志
CREATE TABLE `SystemLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('LOGIN', 'API_MUTATION') NOT NULL,
    `actorType` ENUM('ADMIN', 'USER') NOT NULL,
    `actorId` INTEGER NULL,
    `actorName` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `params` JSON NULL,
    `result` JSON NULL,
    `success` BOOLEAN NOT NULL,
    `error` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `durationMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SystemLog_type_idx`(`type`),
    INDEX `SystemLog_actorId_actorType_idx`(`actorId`, `actorType`),
    INDEX `SystemLog_createdAt_idx`(`createdAt`),
    INDEX `SystemLog_module_idx`(`module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
