import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { AdminCategoriesService } from "../admin-categories.service";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * AdminCategoriesService 单元测试
 * 覆盖维度 CRUD、分类节点 CRUD、树形组装和边界校验
 */
describe("AdminCategoriesService", () => {
  let service: AdminCategoriesService;
  let prisma: PrismaService;

  /** Mock 维度数据 */
  const mockGroup = {
    id: 1,
    name: "技术方向",
    sort: 0,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  /** Mock 扁平分类数组（含多级嵌套） */
  const mockCategoryFlat = [
    {
      id: 1,
      name: "前端",
      groupId: 1,
      parentId: null,
      sort: 0,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "后端",
      groupId: 1,
      parentId: null,
      sort: 1,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "框架",
      groupId: 1,
      parentId: 1,
      sort: 0,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCategoriesService,
        {
          provide: PrismaService,
          useValue: {
            categoryGroup: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            category: {
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            questionCategory: {
              updateMany: jest.fn(),
            },
            userPreference: {
              updateMany: jest.fn(),
            },
            /** 事务 mock：按顺序执行传入的回调函数 */
            $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => {
              // 将 prisma 自身作为 tx 参数传给回调
              return fn(prisma);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AdminCategoriesService>(AdminCategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAllGroups", () => {
    it("返回所有维度并将分类组装为树形结构", async () => {
      // Arrange：维度含三个扁平分类节点（含一个子节点）
      jest
        .spyOn(prisma.categoryGroup, "findMany")
        .mockResolvedValue([
          { ...mockGroup, categories: mockCategoryFlat } as never,
        ]);

      // Act
      const result = await service.findAllGroups();

      // Assert：根节点只有 2 个（parentId = null），"框架" 挂在"前端"下
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe("技术方向");
      expect(result[0].categories).toHaveLength(2);
      const frontend = result[0].categories.find((c) => c.id === 1);
      expect(frontend?.children).toHaveLength(1);
      expect(frontend?.children[0].name).toBe("框架");
    });

    it("无维度时返回空数组", async () => {
      // Arrange
      jest.spyOn(prisma.categoryGroup, "findMany").mockResolvedValue([]);

      // Act
      const result = await service.findAllGroups();

      // Assert
      expect(result).toHaveLength(0);
    });

    it("维度下无分类时 categories 为空数组", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findMany")
        .mockResolvedValue([{ ...mockGroup, categories: [] } as never]);

      // Act
      const result = await service.findAllGroups();

      // Assert
      expect(result[0].categories).toHaveLength(0);
    });

    it("返回的结果包含 id / name / sort / createdAt / updatedAt 字段", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findMany")
        .mockResolvedValue([{ ...mockGroup, categories: [] } as never]);

      // Act
      const result = await service.findAllGroups();

      // Assert
      expect(result[0]).toMatchObject({
        id: 1,
        name: "技术方向",
        sort: 0,
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("createGroup", () => {
    it("创建维度并返回新建结果", async () => {
      // Arrange
      const dto = { name: "难度", sort: 1 };
      const createdGroup = { ...mockGroup, name: "难度", sort: 1 };
      jest
        .spyOn(prisma.categoryGroup, "create")
        .mockResolvedValue(createdGroup);

      // Act
      const result = await service.createGroup(dto);

      // Assert
      expect(result).toEqual(createdGroup);
      expect(prisma.categoryGroup.create).toHaveBeenCalledWith({
        data: { name: "难度", sort: 1 },
      });
    });

    it("sort 未传时默认为 0", async () => {
      // Arrange
      jest.spyOn(prisma.categoryGroup, "create").mockResolvedValue(mockGroup);

      // Act
      await service.createGroup({ name: "题型" });

      // Assert
      expect(prisma.categoryGroup.create).toHaveBeenCalledWith({
        data: { name: "题型", sort: 0 },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updateGroup", () => {
    it("成功更新维度名称", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      const updatedGroup = { ...mockGroup, name: "新名称" };
      jest
        .spyOn(prisma.categoryGroup, "update")
        .mockResolvedValue(updatedGroup);

      // Act
      const result = await service.updateGroup(1, { name: "新名称" });

      // Assert
      expect(result.name).toBe("新名称");
      expect(prisma.categoryGroup.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "新名称" },
      });
    });

    it("成功更新维度排序", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      const updatedGroup = { ...mockGroup, sort: 5 };
      jest
        .spyOn(prisma.categoryGroup, "update")
        .mockResolvedValue(updatedGroup);

      // Act
      const result = await service.updateGroup(1, { sort: 5 });

      // Assert
      expect(result.sort).toBe(5);
    });

    it("维度不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.categoryGroup, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateGroup(999, { name: "x" })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("deleteGroup", () => {
    it("成功删除空维度并返回成功消息", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest.spyOn(prisma.category, "count").mockResolvedValue(0);
      jest.spyOn(prisma.categoryGroup, "delete").mockResolvedValue(mockGroup);

      // Act
      const result = await service.deleteGroup(1);

      // Assert
      expect(result).toEqual({ message: "维度删除成功" });
      expect(prisma.categoryGroup.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("维度不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.categoryGroup, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteGroup(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("维度下有分类节点时拒绝删除并抛出 BadRequestException", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest.spyOn(prisma.category, "count").mockResolvedValue(3);

      // Act & Assert
      await expect(service.deleteGroup(1)).rejects.toThrow(BadRequestException);
      expect(prisma.categoryGroup.delete).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("createCategory", () => {
    it("在维度下成功创建根分类节点（不指定 parentId）", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest.spyOn(prisma.category, "create").mockResolvedValue({} as never);

      // Act
      const result = await service.createCategory(1, { name: "前端" });

      // Assert：普通创建返回 { message }
      expect(result).toEqual({ message: "分类创建成功" });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: "前端", groupId: 1, parentId: null, sort: 0 },
      });
    });

    it("指定合法 parentId 时成功创建子分类节点（父节点已有子节点）", async () => {
      // Arrange：父节点已有一个子节点，不触发通识节点创建
      const parentCategory = {
        id: 1,
        name: "前端",
        groupId: 1,
        parentId: null,
        children: [{ id: 3, name: "框架" }],
      };
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(parentCategory as never);
      jest.spyOn(prisma.category, "create").mockResolvedValue({} as never);

      // Act
      const result = await service.createCategory(1, {
        name: "Vue",
        parentId: 1,
      });

      // Assert
      expect(result).toEqual({ message: "分类创建成功" });
    });

    it("父节点为叶子节点时，自动创建通识节点并迁移数据", async () => {
      // Arrange：父节点无子节点（叶子 → 非叶子，触发通识节点生命周期）
      const leafParent = {
        id: 1,
        name: "前端",
        groupId: 1,
        parentId: null,
        children: [], // 无子节点 = 叶子
      };
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(leafParent as never);
      // Mock 通识节点创建返回
      const defaultNode = { id: 100, name: "通识", isDefault: true };
      jest
        .spyOn(prisma.category, "create")
        .mockResolvedValueOnce(defaultNode as never) // 通识节点
        .mockResolvedValueOnce({} as never); // 用户请求的新节点

      // Act
      const result = await service.createCategory(1, {
        name: "Vue",
        parentId: 1,
      });

      // Assert：事务中创建了通识节点 + 迁移数据 + 创建新节点
      expect(result).toEqual({ message: "分类创建成功（已自动生成通识节点）" });
      // 第一次调用创建通识节点
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "通识",
          groupId: 1,
          parentId: 1,
          sort: 9999,
          isDefault: true,
        },
      });
      // 第二次调用创建用户请求的节点
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: "Vue", groupId: 1, parentId: 1, sort: 0 },
      });
      // 迁移 QuestionCategory 和 UserPreference
      expect(prisma.questionCategory.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 1 },
        data: { categoryId: 100 },
      });
      expect(prisma.userPreference.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 1 },
        data: { categoryId: 100 },
      });
    });

    it("维度不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.categoryGroup, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createCategory(999, { name: "Vue" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("父节点不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest.spyOn(prisma.category, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createCategory(1, { name: "Vue", parentId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("父节点属于不同维度时抛出 BadRequestException", async () => {
      // Arrange
      const parentInOtherGroup = {
        id: 1,
        name: "前端",
        groupId: 2,
        parentId: null,
        children: [],
      };
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(parentInOtherGroup as never);

      // Act & Assert
      await expect(
        service.createCategory(1, { name: "Vue", parentId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("sort 未传时默认为 0", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup);
      jest.spyOn(prisma.category, "create").mockResolvedValue({
        id: 10,
        name: "前端",
        groupId: 1,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      // Act
      await service.createCategory(1, { name: "前端" });

      // Assert
      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ sort: 0 }) }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updateCategory", () => {
    const mockCategory = {
      id: 1,
      name: "前端",
      groupId: 1,
      parentId: null,
      isDefault: false,
    };

    it("成功更新分类节点名称", async () => {
      // Arrange
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(mockCategory as never);
      const updated = { ...mockCategory, name: "后端" };
      jest.spyOn(prisma.category, "update").mockResolvedValue(updated as never);

      // Act
      const result = await service.updateCategory(1, { name: "后端" });

      // Assert
      expect(result.name).toBe("后端");
    });

    it("分类节点不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.category, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateCategory(999, { name: "x" })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("parentId 设为自身 id 时抛出 BadRequestException", async () => {
      // Arrange
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(mockCategory as never);

      // Act & Assert
      await expect(service.updateCategory(1, { parentId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("新父节点不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValueOnce(mockCategory as never) // 当前节点
        .mockResolvedValueOnce(null); // 新父节点不存在

      // Act & Assert
      await expect(
        service.updateCategory(1, { parentId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("新父节点属于不同维度时抛出 BadRequestException", async () => {
      // Arrange
      const parentInOtherGroup = {
        id: 5,
        name: "其他",
        groupId: 2,
        parentId: null,
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValueOnce(mockCategory as never) // 当前节点（groupId=1）
        .mockResolvedValueOnce(parentInOtherGroup as never); // 父节点在维度 2

      // Act & Assert
      await expect(service.updateCategory(1, { parentId: 5 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("通识节点不可编辑，抛出 BadRequestException", async () => {
      // Arrange
      const defaultCategory = {
        id: 10,
        name: "通识",
        groupId: 1,
        parentId: 1,
        isDefault: true,
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(defaultCategory as never);

      // Act & Assert
      await expect(
        service.updateCategory(10, { name: "新名字" }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateCategory(10, { name: "新名字" }),
      ).rejects.toThrow("通识节点不可编辑");
      expect(prisma.category.update).not.toHaveBeenCalled();
    });

    it("parentId 未定义时不更新父节点字段", async () => {
      // Arrange
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(mockCategory as never);
      jest
        .spyOn(prisma.category, "update")
        .mockResolvedValue(mockCategory as never);

      // Act
      await service.updateCategory(1, { name: "新名字" });

      // Assert：update 的 data 中不包含 parentId
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "新名字" },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("deleteCategory", () => {
    it("成功删除叶节点且无题目关联的分类（无父节点）", async () => {
      // Arrange
      const leafCategory = {
        id: 3,
        name: "框架",
        groupId: 1,
        parentId: null,
        isDefault: false,
        children: [],
        questionCategories: [],
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(leafCategory as never);
      jest
        .spyOn(prisma.category, "delete")
        .mockResolvedValue(leafCategory as never);

      // Act
      const result = await service.deleteCategory(3);

      // Assert
      expect(result).toEqual({ message: "分类删除成功" });
    });

    it("分类节点不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.category, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteCategory(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("通识节点不可直接删除", async () => {
      // Arrange
      const defaultCategory = {
        id: 10,
        name: "通识",
        groupId: 1,
        parentId: 1,
        isDefault: true,
        children: [],
        questionCategories: [],
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(defaultCategory as never);

      // Act & Assert
      await expect(service.deleteCategory(10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("分类有子节点时拒绝删除并抛出 BadRequestException", async () => {
      // Arrange
      const categoryWithChildren = {
        id: 1,
        name: "前端",
        isDefault: false,
        children: [{ id: 3, name: "框架" }],
        questionCategories: [],
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(categoryWithChildren as never);

      // Act & Assert
      await expect(service.deleteCategory(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("分类已关联题目时拒绝删除并抛出 BadRequestException", async () => {
      // Arrange
      const categoryWithQuestions = {
        id: 3,
        name: "框架",
        isDefault: false,
        children: [],
        questionCategories: [
          { questionId: 1, categoryId: 3 },
          { questionId: 2, categoryId: 3 },
        ],
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(categoryWithQuestions as never);

      // Act & Assert
      await expect(service.deleteCategory(3)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("删除后有父节点，兄弟仅剩通识 → 自动回收通识节点", async () => {
      // Arrange：待删除节点有 parentId，删除后兄弟只剩一个通识节点
      const leafWithParent = {
        id: 5,
        name: "Vue",
        groupId: 1,
        parentId: 1,
        isDefault: false,
        children: [],
        questionCategories: [],
      };
      const defaultSibling = {
        id: 100,
        name: "通识",
        groupId: 1,
        parentId: 1,
        isDefault: true,
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(leafWithParent as never);
      jest
        .spyOn(prisma.category, "delete")
        .mockResolvedValue(leafWithParent as never);
      // 删除后查询兄弟，只剩通识
      jest
        .spyOn(prisma.category, "findMany")
        .mockResolvedValue([defaultSibling] as never);

      // Act
      const result = await service.deleteCategory(5);

      // Assert：事务执行了删除 + 回收通识
      expect(result).toEqual({ message: "分类删除成功" });
      // 删除原节点
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 5 } });
      // 通识节点的数据迁移回父节点
      expect(prisma.questionCategory.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 100 },
        data: { categoryId: 1 },
      });
      expect(prisma.userPreference.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 100 },
        data: { categoryId: 1 },
      });
      // 删除通识节点
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 100 },
      });
    });

    it("删除后兄弟不止通识一个 → 不触发回收", async () => {
      // Arrange：删除后兄弟还有 2 个（一个通识 + 一个普通）
      const leafWithParent = {
        id: 5,
        name: "Vue",
        groupId: 1,
        parentId: 1,
        isDefault: false,
        children: [],
        questionCategories: [],
      };
      const remainingSiblings = [
        { id: 100, name: "通识", parentId: 1, isDefault: true },
        { id: 6, name: "React", parentId: 1, isDefault: false },
      ];
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(leafWithParent as never);
      jest
        .spyOn(prisma.category, "delete")
        .mockResolvedValue(leafWithParent as never);
      jest
        .spyOn(prisma.category, "findMany")
        .mockResolvedValue(remainingSiblings as never);

      // Act
      const result = await service.deleteCategory(5);

      // Assert：删除成功，但不触发通识回收
      expect(result).toEqual({ message: "分类删除成功" });
      expect(prisma.questionCategory.updateMany).not.toHaveBeenCalled();
      expect(prisma.userPreference.updateMany).not.toHaveBeenCalled();
    });

    it("删除无父节点的根分类 → 不检查兄弟回收", async () => {
      // Arrange：根节点（parentId = null）
      const rootLeaf = {
        id: 2,
        name: "后端",
        groupId: 1,
        parentId: null,
        isDefault: false,
        children: [],
        questionCategories: [],
      };
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(rootLeaf as never);
      jest
        .spyOn(prisma.category, "delete")
        .mockResolvedValue(rootLeaf as never);

      // Act
      const result = await service.deleteCategory(2);

      // Assert
      expect(result).toEqual({ message: "分类删除成功" });
      expect(prisma.category.findMany).not.toHaveBeenCalled(); // 不查兄弟
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAllGroupsWithParent", () => {
    it("返回带 parent 信息的维度树（供题目列表显示名拼接）", async () => {
      // Arrange
      jest
        .spyOn(prisma.categoryGroup, "findMany")
        .mockResolvedValue([
          { ...mockGroup, categories: mockCategoryFlat } as never,
        ]);

      // Act
      const result = await service.findAllGroupsWithParent();

      // Assert：结构与 findAllGroups 相同
      expect(result).toHaveLength(1);
      expect(result[0].categories).toHaveLength(2);
      // 验证 findMany 包含 parent include
      expect(prisma.categoryGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            categories: expect.objectContaining({
              include: { parent: { select: { id: true, name: true } } },
            }),
          }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("_buildTree（通过 findAllGroups 间接测试）", () => {
    it("树中节点包含 isDefault 字段", async () => {
      // Arrange：含一个通识节点
      const flatWithDefault = [
        ...mockCategoryFlat,
        {
          id: 99,
          name: "通识",
          groupId: 1,
          parentId: 1,
          sort: 9999,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(prisma.categoryGroup, "findMany")
        .mockResolvedValue([
          { ...mockGroup, categories: flatWithDefault } as never,
        ]);

      // Act
      const result = await service.findAllGroups();

      // Assert
      const frontend = result[0].categories.find((c) => c.id === 1);
      expect(frontend).toBeDefined();
      expect(frontend!.isDefault).toBe(false);
      // 通识节点挂在前端下
      const defaultChild = frontend!.children.find((c) => c.id === 99);
      expect(defaultChild).toBeDefined();
      expect(defaultChild!.isDefault).toBe(true);
      expect(defaultChild!.name).toBe("通识");
    });
  });
});
