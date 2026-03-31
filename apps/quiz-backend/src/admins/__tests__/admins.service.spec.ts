import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { AdminsService } from "../admins.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AdminStatus } from "@prisma/client";

// Mock bcrypt module
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from "bcrypt";

/**
 * Admins Service 单元测试
 * 测试 CRUD、密码加密和业务规则保护
 */
describe("AdminsService", () => {
  let service: AdminsService;
  let prisma: PrismaService;

  const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  // Mock 数据
  const mockSuperAdmin = {
    id: 1,
    username: "super_admin",
    password: "$2b$10$hashedPassword",
    nickname: "超级管理员",
    roleId: 1,
    status: "ACTIVE" as AdminStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
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
    },
  };

  const mockNormalAdmin = {
    id: 2,
    username: "admin",
    password: "$2b$10$hashedPassword",
    nickname: "普通管理员",
    roleId: 3,
    status: "ACTIVE" as AdminStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      id: 3,
      name: "用户管理员",
      description: "管理 App 用户",
      isSystem: false,
      menuPermissions: ["dashboard", "users"],
      apiPermissions: ["users:*"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminsService>(AdminsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear mock calls
    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("应该返回所有管理员（不含密码）", async () => {
      // Arrange
      const mockAdmins = [mockSuperAdmin, mockNormalAdmin];
      jest.spyOn(prisma.admin, "findMany").mockResolvedValue(mockAdmins);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      result.forEach((admin) => {
        expect(admin).not.toHaveProperty("password");
        expect(admin).toHaveProperty("role");
        expect(admin).toHaveProperty("roleName");
      });
      expect(result[0].role).toBe("super_admin");
      expect(result[1].role).toBe("admin");
    });
  });

  describe("findOne", () => {
    it("应该返回指定管理员（不含密码）", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);

      // Act
      const result = await service.findOne(2);

      // Assert
      expect(result).not.toHaveProperty("password");
      expect(result).toHaveProperty("username", "admin");
      expect(result).toHaveProperty("role", "admin");
      expect(result).toHaveProperty("roleName", "用户管理员");
    });

    it("不存在的管理员应该抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException("管理员 ID 999 不存在"),
      );
    });
  });

  describe("create", () => {
    it("应该创建新管理员（密码加密）", async () => {
      // Arrange
      const createDto = {
        username: "new_admin",
        password: "password123",
        nickname: "新管理员",
        roleId: 3,
      };
      const hashedPassword = "$2b$10$newHashedPassword";
      mockBcryptHash.mockResolvedValue(hashedPassword as never);
      jest
        .spyOn(prisma.role, "findUnique")
        .mockResolvedValue(mockNormalAdmin.role);
      const createSpy = jest.spyOn(prisma.admin, "create").mockResolvedValue({
        id: 3,
        username: createDto.username,
        password: hashedPassword,
        nickname: createDto.nickname,
        roleId: createDto.roleId,
        status: "ACTIVE" as AdminStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: mockNormalAdmin.role,
      } as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).not.toHaveProperty("password");
      expect(result).toHaveProperty("username", "new_admin");
      expect(mockBcryptHash).toHaveBeenCalledWith("password123", 10);
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          username: "new_admin",
          password: hashedPassword,
          nickname: "新管理员",
          roleId: 3,
          status: "ACTIVE",
        },
        include: { role: true },
      });
    });

    it("重复的用户名应该抛出 ConflictException", async () => {
      // Arrange
      const createDto = {
        username: "super_admin",
        password: "password123",
        nickname: "重复用户名",
        roleId: 3,
      };
      mockBcryptHash.mockResolvedValue("hashed" as never);
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockSuperAdmin);
      jest
        .spyOn(prisma.role, "findUnique")
        .mockResolvedValue(mockNormalAdmin.role);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(`用户名 "${createDto.username}" 已存在`),
      );
    });

    it("指定的角色 ID 不存在时应该抛出 NotFoundException", async () => {
      // Arrange：用户名不重复，但角色 ID 不存在
      const createDto = {
        username: "new_user",
        password: "password123",
        nickname: "新管理员",
        roleId: 999,
      };
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null); // 用户名不重复
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(null); // 角色不存在

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`角色 ID ${createDto.roleId} 不存在`),
      );
    });
  });

  describe("updateRole", () => {
    it("应该更新普通管理员的角色", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue({
        id: 2,
        name: "内容管理员",
        description: "管理题目和标签",
        isSystem: false,
        menuPermissions: ["dashboard", "questions"],
        apiPermissions: ["questions:*"],
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { admins: 0 },
      } as any);
      jest.spyOn(prisma.admin, "update").mockResolvedValue({
        ...mockNormalAdmin,
        roleId: 2,
        role: {
          id: 2,
          name: "内容管理员",
          description: "管理题目和标签",
          isSystem: false,
          menuPermissions: ["dashboard", "questions"],
          apiPermissions: ["questions:*"],
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { admins: 0 },
        },
      } as any);

      // Act
      const result = await service.updateRole(2, { roleId: 2 });

      // Assert
      expect(result).not.toHaveProperty("password");
      expect(result.roleId).toBe(2);
      expect(result.roleName).toBe("内容管理员");
    });

    it("超级管理员的角色不可修改", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockSuperAdmin);

      // Act & Assert
      await expect(service.updateRole(1, { roleId: 2 })).rejects.toThrow(
        new ForbiddenException("超级管理员账号的角色不可修改"),
      );
    });

    it("管理员 ID 不存在时应该抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateRole(999, { roleId: 2 })).rejects.toThrow(
        new NotFoundException("管理员 ID 999 不存在"),
      );
    });

    it("新角色 ID 不存在时应该抛出 NotFoundException", async () => {
      // Arrange：管理员存在，但目标角色不存在
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      jest.spyOn(prisma.role, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateRole(2, { roleId: 999 })).rejects.toThrow(
        new NotFoundException("角色 ID 999 不存在"),
      );
    });
  });

  describe("remove", () => {
    it("应该删除普通管理员", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      const deleteSpy = jest
        .spyOn(prisma.admin, "delete")
        .mockResolvedValue(mockNormalAdmin);

      // Act
      const result = await service.remove(2);

      // Assert
      expect(result).not.toHaveProperty("password");
      expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it("超级管理员账号不可删除", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockSuperAdmin);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        new ForbiddenException("超级管理员账号不可删除"),
      );
    });

    it("不存在的管理员应该抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException("管理员 ID 999 不存在"),
      );
    });
  });

  describe("密码字段移除", () => {
    it("所有返回的管理员数据都不应包含密码", async () => {
      // Arrange
      jest
        .spyOn(prisma.admin, "findMany")
        .mockResolvedValue([mockSuperAdmin, mockNormalAdmin]);
      jest
        .spyOn(prisma.admin, "findUnique")
        .mockResolvedValueOnce(mockNormalAdmin) // findOne call
        .mockResolvedValueOnce(null) // create - username check (not exist)
        .mockResolvedValueOnce(mockNormalAdmin) // updateRole - admin check
        .mockResolvedValueOnce(mockNormalAdmin); // updateRole - admin check (for later calls)
      jest
        .spyOn(prisma.role, "findUnique")
        .mockResolvedValueOnce(mockNormalAdmin.role) // create - role check
        .mockResolvedValueOnce(mockNormalAdmin.role); // updateRole - role check
      jest.spyOn(prisma.admin, "create").mockResolvedValue(mockNormalAdmin);
      jest.spyOn(prisma.admin, "update").mockResolvedValue(mockNormalAdmin);
      mockBcryptHash.mockResolvedValue("hashed" as never);

      // Act
      const findAllResult = await service.findAll();
      const findOneResult = await service.findOne(2);
      const createResult = await service.create({
        username: "test",
        password: "test",
        nickname: "test",
        roleId: 3,
      });
      const updateResult = await service.updateRole(2, { roleId: 2 });

      // Assert
      findAllResult.forEach((admin) =>
        expect(admin).not.toHaveProperty("password"),
      );
      expect(findOneResult).not.toHaveProperty("password");
      expect(createResult).not.toHaveProperty("password");
      expect(updateResult).not.toHaveProperty("password");
    });
  });

  describe("changeMyPassword", () => {
    it("当前密码正确时应该更新密码", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      mockBcryptCompare.mockResolvedValue(true as never);
      const newHash = "$2b$10$newHash";
      mockBcryptHash.mockResolvedValue(newHash as never);
      const updateSpy = jest
        .spyOn(prisma.admin, "update")
        .mockResolvedValue(mockNormalAdmin);

      // Act
      await service.changeMyPassword(2, {
        currentPassword: "oldPass",
        newPassword: "newPass123",
      });

      // Assert
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        "oldPass",
        mockNormalAdmin.password,
      );
      expect(mockBcryptHash).toHaveBeenCalledWith("newPass123", 10);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { password: newHash },
      });
    });

    it("当前密码错误时应该抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      mockBcryptCompare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        service.changeMyPassword(2, {
          currentPassword: "wrongPass",
          newPassword: "newPass123",
        }),
      ).rejects.toThrow(new BadRequestException("当前密码错误"));
    });

    it("新密码与当前密码相同时应该抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      mockBcryptCompare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(
        service.changeMyPassword(2, {
          currentPassword: "samePass",
          newPassword: "samePass",
        }),
      ).rejects.toThrow(new BadRequestException("新密码不能与当前密码相同"));
    });

    it("管理员不存在时应该抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changeMyPassword(999, {
          currentPassword: "pass",
          newPassword: "newPass123",
        }),
      ).rejects.toThrow(new NotFoundException("管理员 ID 999 不存在"));
    });
  });

  describe("role 字段兼容性", () => {
    it("超级管理员应该返回 role: 'super_admin'", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockSuperAdmin);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result.role).toBe("super_admin");
      expect(result.roleId).toBe(1);
    });

    it("普通管理员应该返回 role: 'admin'", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);

      // Act
      const result = await service.findOne(2);

      // Assert
      expect(result.role).toBe("admin");
      expect(result.roleId).toBe(3);
    });
  });
});
