import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { RolesService } from "../roles.service";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Roles Service 单元测试
 * 测试 CRUD 和业务规则保护
 */
describe("RolesService", () => {
  let service: RolesService;
  let prisma: PrismaService;

  // Mock 数据
  const mockSuperAdminRole = {
    id: 1,
    name: "超级管理员",
    description: "系统最高权限",
    isSystem: true,
    menuPermissions: [
      "dashboard",
      "users",
      "admins",
      "roles",
      "questions",
      "system",
    ],
    apiPermissions: ["*:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockContentRole = {
    id: 2,
    name: "内容管理员",
    description: "管理题目和标签",
    isSystem: false,
    menuPermissions: ["dashboard", "questions"],
    apiPermissions: ["questions:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRole = {
    id: 3,
    name: "用户管理员",
    description: "管理 App 用户",
    isSystem: false,
    menuPermissions: ["dashboard", "users"],
    apiPermissions: ["users:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: {
            role: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            admin: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("应该返回所有角色", async () => {
      // Arrange
      const mockRoles = [mockSuperAdminRole, mockContentRole, mockUserRole];
      jest.spyOn(prisma.role, "findMany").mockResolvedValue(mockRoles);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockRoles);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        orderBy: { id: "asc" },
        include: {
          _count: {
            select: { admins: true },
          },
        },
      });
    });
  });

  describe("findOne", () => {
    it("应该返回指定角色", async () => {
      // Arrange
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(mockContentRole);

      // Act
      const result = await service.findOne(2);

      // Assert
      expect(result).toEqual(mockContentRole);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
        include: {
          _count: {
            select: { admins: true },
          },
        },
      });
    });

    it("不存在的角色应该抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException("角色 ID 999 不存在"),
      );
    });
  });

  describe("create", () => {
    it("应该创建新角色", async () => {
      // Arrange
      const createDto = {
        name: "测试角色",
        description: "测试描述",
        isSystem: false,
        menuPermissions: ["dashboard"],
        apiPermissions: ["users:list"],
      };
      const mockCreatedRole = {
        id: 4,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.role, "create").mockResolvedValue(mockCreatedRole);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockCreatedRole);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe("update", () => {
    it("应该更新普通角色", async () => {
      // Arrange
      const updateDto = {
        name: "更新后的名称",
        description: "更新后的描述",
      };
      const mockUpdatedRole = {
        ...mockContentRole,
        ...updateDto,
      };
      jest
        .spyOn(prisma.role, "findUnique")
        .mockResolvedValueOnce(mockContentRole) // findOne call
        .mockResolvedValueOnce(null); // name uniqueness check
      jest.spyOn(prisma.role, "update").mockResolvedValue(mockUpdatedRole);

      // Act
      const result = await service.update(2, updateDto);

      // Assert
      expect(result).toEqual(mockUpdatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { name: "更新后的名称", description: "更新后的描述" },
      });
    });

    it("超级管理员角色不可修改", async () => {
      // Arrange
      jest
        .spyOn(prisma.role, "findUnique")
        .mockResolvedValue(mockSuperAdminRole);

      // Act & Assert
      await expect(service.update(1, { name: "修改超管" })).rejects.toThrow(
        new ForbiddenException("超级管理员角色不可修改"),
      );
    });

    it("系统内置角色不可修改", async () => {
      // Arrange
      const systemRole = { ...mockContentRole, isSystem: true };
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(systemRole);

      // Act & Assert
      await expect(service.update(2, { name: "修改系统角色" })).rejects.toThrow(
        new ForbiddenException("系统内置角色不可修改"),
      );
    });

    it("应该支持只更新部分字段", async () => {
      // Arrange
      const updateDto = { description: "只更新描述" };
      const mockUpdatedRole = {
        ...mockContentRole,
        description: "只更新描述",
      };
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(mockContentRole);
      jest.spyOn(prisma.role, "update").mockResolvedValue(mockUpdatedRole);

      // Act
      const result = await service.update(2, updateDto);

      // Assert
      expect(result).toEqual(mockUpdatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { description: "只更新描述" },
      });
    });
  });

  describe("remove", () => {
    it("应该删除未使用的普通角色", async () => {
      // Arrange
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(mockContentRole);
      jest.spyOn(prisma.admin, "count").mockResolvedValue(0);
      jest.spyOn(prisma.role, "delete").mockResolvedValue(mockContentRole);

      // Act
      const result = await service.remove(2);

      // Assert
      expect(result).toEqual({ message: "角色删除成功" });
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it("超级管理员角色不可删除", async () => {
      // Arrange
      jest
        .spyOn(prisma.role, "findUnique")
        .mockResolvedValue(mockSuperAdminRole);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        new ForbiddenException("超级管理员角色不可删除"),
      );
    });

    it("系统内置角色不可删除", async () => {
      // Arrange
      const systemRole = { ...mockContentRole, isSystem: true };
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(systemRole);

      // Act & Assert
      await expect(service.remove(2)).rejects.toThrow(
        new ForbiddenException("系统内置角色不可删除"),
      );
    });

    it("正在使用的角色不可删除", async () => {
      // Arrange
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(mockContentRole);
      jest.spyOn(prisma.admin, "count").mockResolvedValue(3); // 3 个管理员使用该角色

      // Act & Assert
      await expect(service.remove(2)).rejects.toThrow(
        new BadRequestException("该角色正被 3 个管理员使用，无法删除"),
      );
    });
  });
});
