-- 多面分类体系：新增 CategoryGroup、Category、QuestionCategory 三张表

CREATE TABLE `CategoryGroup` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `name`      VARCHAR(191) NOT NULL,
  `sort`      INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL
);

CREATE TABLE `Category` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `name`      VARCHAR(191) NOT NULL,
  `groupId`   INT NOT NULL,
  `parentId`  INT NULL,
  `sort`      INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Category_groupId_idx`  (`groupId`),
  INDEX `Category_parentId_idx` (`parentId`),
  CONSTRAINT `Category_groupId_fkey`  FOREIGN KEY (`groupId`)  REFERENCES `CategoryGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`)      ON DELETE SET NULL  ON UPDATE CASCADE
);

CREATE TABLE `QuestionCategory` (
  `questionId` INT NOT NULL,
  `categoryId` INT NOT NULL,
  PRIMARY KEY (`questionId`, `categoryId`),
  INDEX `QuestionCategory_categoryId_idx` (`categoryId`),
  CONSTRAINT `QuestionCategory_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `QuestionCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);
