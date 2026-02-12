import { Test, TestingModule } from "@nestjs/testing";
import { AdminsController } from "../admins.controller";
import { AdminsService } from "../admins.service";

/**
 * Admins Controller 单元测试
 * 测试路由处理和响应格式
 */
describe("AdminsController", () => {
  let controller: AdminsController;
  let service: AdminsService;

  const mockAdmin = {
    id: 2,
    username: "admin",
    nickname: "普通管理员",
    role: "admin",
    roleId: 3,
    roleName: "用户管理员",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmins = [mockAdmin];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [
        {
          provide: AdminsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateRole: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminsController>(AdminsController);
    service = module.get<AdminsService>(AdminsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("应该返回所有管理员", async () => {
      // Arrange
      jest.spyOn(service, "findAll").mockResolvedValue(mockAdmins as never);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockAdmins);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("应该返回指定管理员", async () => {
      // Arrange
      jest.spyOn(service, "findOne").mockResolvedValue(mockAdmin as never);

      // Act
      const result = await controller.findOne(2);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe("create", () => {
    it("应该创建新管理员", async () => {
      // Arrange
      const createDto = {
        username: "new_admin",
        password: "password123",
        nickname: "新管理员",
        roleId: 3,
      };
      const createdAdmin = {
        id: 3,
        username: "new_admin",
        nickname: "新管理员",
        role: "admin",
        roleId: 3,
        roleName: "用户管理员",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, "create").mockResolvedValue(createdAdmin as never);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(createdAdmin);
      expect(result).not.toHaveProperty("password");
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("updateRole", () => {
    it("应该更新管理员角色", async () => {
      // Arrange
      const updateDto = { roleId: 2 };
      const updatedAdmin = {
        ...mockAdmin,
        roleId: 2,
        roleName: "内容管理员",
      };
      jest
        .spyOn(service, "updateRole")
        .mockResolvedValue(updatedAdmin as never);

      // Act
      const result = await controller.updateRole(2, updateDto);

      // Assert
      expect(result).toEqual(updatedAdmin);
      expect(service.updateRole).toHaveBeenCalledWith(2, updateDto);
    });
  });

  describe("remove", () => {
    it("应该删除管理员", async () => {
      // Arrange
      jest.spyOn(service, "remove").mockResolvedValue(mockAdmin as never);

      // Act
      const result = await controller.remove(2);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(service.remove).toHaveBeenCalledWith(2);
    });
  });
});
