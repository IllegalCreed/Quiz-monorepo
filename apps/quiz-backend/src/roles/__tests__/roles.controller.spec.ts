import { Test, TestingModule } from "@nestjs/testing";
import { RolesController } from "../roles.controller";
import { RolesService } from "../roles.service";

/**
 * Roles Controller 单元测试
 * 测试路由处理和响应格式
 */
describe("RolesController", () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRole = {
    id: 2,
    name: "内容管理员",
    description: "管理题目和标签",
    isSystem: false,
    menuPermissions: ["dashboard", "questions"],
    apiPermissions: ["questions:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { admins: 0 },
  };

  const mockRoles = [mockRole];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("应该返回所有角色", async () => {
      // Arrange
      jest.spyOn(service, "findAll").mockResolvedValue(mockRoles);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockRoles);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("应该返回指定角色", async () => {
      // Arrange
      jest.spyOn(service, "findOne").mockResolvedValue(mockRole);

      // Act
      const result = await controller.findOne(2);

      // Assert
      expect(result).toEqual(mockRole);
      expect(service.findOne).toHaveBeenCalledWith(2);
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
      jest
        .spyOn(service, "create")
        .mockResolvedValue({ id: 3, ...createDto } as never);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual({ id: 3, ...createDto });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("update", () => {
    it("应该更新角色", async () => {
      // Arrange
      const updateDto = {
        name: "更新后的名称",
        description: "更新后的描述",
      };
      const updatedRole = { ...mockRole, ...updateDto };
      jest.spyOn(service, "update").mockResolvedValue(updatedRole);

      // Act
      const result = await controller.update(2, updateDto);

      // Assert
      expect(result).toEqual(updatedRole);
      expect(service.update).toHaveBeenCalledWith(2, updateDto);
    });
  });

  describe("remove", () => {
    it("应该删除角色", async () => {
      // Arrange
      jest
        .spyOn(service, "remove")
        .mockResolvedValue({ message: "角色删除成功" });

      // Act
      const result = await controller.remove(2);

      // Assert
      expect(result).toEqual({ message: "角色删除成功" });
      expect(service.remove).toHaveBeenCalledWith(2);
    });
  });
});
