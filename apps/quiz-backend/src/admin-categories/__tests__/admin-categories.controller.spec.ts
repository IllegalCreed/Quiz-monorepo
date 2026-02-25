import { Test, TestingModule } from "@nestjs/testing";
import { AdminCategoriesController } from "../admin-categories.controller";
import { AdminCategoriesService } from "../admin-categories.service";

/**
 * AdminCategoriesController 单元测试
 * 验证路由委托和参数透传，业务逻辑由 Service 测试覆盖
 */
describe("AdminCategoriesController", () => {
  let controller: AdminCategoriesController;
  let service: AdminCategoriesService;

  /** Mock 维度数据 */
  const mockGroup = {
    id: 1,
    name: "技术方向",
    sort: 0,
    categories: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  /** Mock 分类节点数据 */
  const mockCategory = {
    id: 1,
    name: "前端",
    groupId: 1,
    parentId: null,
    sort: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCategoriesController],
      providers: [
        {
          provide: AdminCategoriesService,
          useValue: {
            findAllGroups: jest.fn(),
            createGroup: jest.fn(),
            updateGroup: jest.fn(),
            deleteGroup: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminCategoriesController>(
      AdminCategoriesController,
    );
    service = module.get<AdminCategoriesService>(AdminCategoriesService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAllGroups", () => {
    it("应该委托给 service.findAllGroups 并返回维度列表", async () => {
      // Arrange
      const groups = [mockGroup];
      jest.spyOn(service, "findAllGroups").mockResolvedValue(groups as never);

      // Act
      const result = await controller.findAllGroups();

      // Assert
      expect(result).toEqual(groups);
      expect(service.findAllGroups).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("createGroup", () => {
    it("应该将 dto 透传给 service.createGroup 并返回新建维度", async () => {
      // Arrange
      const dto = { name: "难度", sort: 1 };
      jest.spyOn(service, "createGroup").mockResolvedValue(mockGroup as never);

      // Act
      const result = await controller.createGroup(dto);

      // Assert
      expect(result).toEqual(mockGroup);
      expect(service.createGroup).toHaveBeenCalledWith(dto);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updateGroup", () => {
    it("应该将 id + dto 透传给 service.updateGroup 并返回更新结果", async () => {
      // Arrange
      const dto = { name: "新维度名称" };
      const updatedGroup = { ...mockGroup, name: "新维度名称" };
      jest
        .spyOn(service, "updateGroup")
        .mockResolvedValue(updatedGroup as never);

      // Act
      const result = await controller.updateGroup(1, dto);

      // Assert
      expect(result.name).toBe("新维度名称");
      expect(service.updateGroup).toHaveBeenCalledWith(1, dto);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("deleteGroup", () => {
    it("应该将 id 透传给 service.deleteGroup 并返回成功消息", async () => {
      // Arrange
      const mockResult = { message: "维度删除成功" };
      jest.spyOn(service, "deleteGroup").mockResolvedValue(mockResult as never);

      // Act
      const result = await controller.deleteGroup(1);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.deleteGroup).toHaveBeenCalledWith(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("createCategory", () => {
    it("应该将 groupId + dto 透传给 service.createCategory 并返回新建分类", async () => {
      // Arrange
      const dto = { name: "前端" };
      jest
        .spyOn(service, "createCategory")
        .mockResolvedValue(mockCategory as never);

      // Act
      const result = await controller.createCategory(1, dto);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(service.createCategory).toHaveBeenCalledWith(1, dto);
    });

    it("创建子分类时 groupId + dto（含 parentId）正确透传", async () => {
      // Arrange
      const dto = { name: "Vue", parentId: 1 };
      const childCategory = {
        ...mockCategory,
        id: 2,
        name: "Vue",
        parentId: 1,
      };
      jest
        .spyOn(service, "createCategory")
        .mockResolvedValue(childCategory as never);

      // Act
      const result = await controller.createCategory(1, dto);

      // Assert
      expect(result.parentId).toBe(1);
      expect(service.createCategory).toHaveBeenCalledWith(1, dto);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updateCategory", () => {
    it("应该将 id + dto 透传给 service.updateCategory 并返回更新后的分类", async () => {
      // Arrange
      const dto = { name: "新分类名称" };
      const updatedCategory = { ...mockCategory, name: "新分类名称" };
      jest
        .spyOn(service, "updateCategory")
        .mockResolvedValue(updatedCategory as never);

      // Act
      const result = await controller.updateCategory(1, dto);

      // Assert
      expect(result.name).toBe("新分类名称");
      expect(service.updateCategory).toHaveBeenCalledWith(1, dto);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("deleteCategory", () => {
    it("应该将 id 透传给 service.deleteCategory 并返回成功消息", async () => {
      // Arrange
      const mockResult = { message: "分类删除成功" };
      jest
        .spyOn(service, "deleteCategory")
        .mockResolvedValue(mockResult as never);

      // Act
      const result = await controller.deleteCategory(1);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.deleteCategory).toHaveBeenCalledWith(1);
    });
  });
});
