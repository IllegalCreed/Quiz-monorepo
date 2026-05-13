import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "../categories.controller";
import { AdminCategoriesService } from "../../admin-categories/admin-categories.service";

/**
 * CategoriesController 单元测试（公开分类接口）
 * 验证 GET /categories/groups 正确委托给 AdminCategoriesService
 */
describe("CategoriesController", () => {
  let controller: CategoriesController;
  let service: AdminCategoriesService;

  /** Mock 维度树响应 */
  const mockGroupsTree = [
    {
      id: 1,
      name: "技术方向",
      sort: 0,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      categories: [
        {
          id: 1,
          name: "前端",
          sort: 0,
          isDefault: false,
          children: [
            { id: 3, name: "框架", sort: 0, isDefault: false, children: [] },
            {
              id: 99,
              name: "通识",
              sort: 9999,
              isDefault: true,
              children: [],
            },
          ],
        },
        {
          id: 2,
          name: "后端",
          sort: 1,
          isDefault: false,
          children: [],
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: AdminCategoriesService,
          useValue: {
            findAllGroups: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<AdminCategoriesService>(AdminCategoriesService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("findAllGroups", () => {
    it("应该委托给 AdminCategoriesService.findAllGroups 并返回维度树", async () => {
      // Arrange
      jest.spyOn(service, "findAllGroups").mockResolvedValue(mockGroupsTree);

      // Act
      const result = await controller.findAllGroups();

      // Assert
      expect(result).toEqual(mockGroupsTree);
      expect(service.findAllGroups).toHaveBeenCalledTimes(1);
    });

    it("无维度时返回空数组", async () => {
      // Arrange
      jest.spyOn(service, "findAllGroups").mockResolvedValue([]);

      // Act
      const result = await controller.findAllGroups();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
