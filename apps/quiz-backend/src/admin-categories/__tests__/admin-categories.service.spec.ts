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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "后端",
      groupId: 1,
      parentId: null,
      sort: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "框架",
      groupId: 1,
      parentId: 1,
      sort: 0,
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
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
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
        .mockResolvedValue(createdGroup as never);

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
      jest
        .spyOn(prisma.categoryGroup, "create")
        .mockResolvedValue(mockGroup as never);

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
        .mockResolvedValue(mockGroup as never);
      const updatedGroup = { ...mockGroup, name: "新名称" };
      jest
        .spyOn(prisma.categoryGroup, "update")
        .mockResolvedValue(updatedGroup as never);

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
        .mockResolvedValue(mockGroup as never);
      const updatedGroup = { ...mockGroup, sort: 5 };
      jest
        .spyOn(prisma.categoryGroup, "update")
        .mockResolvedValue(updatedGroup as never);

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
        .mockResolvedValue(mockGroup as never);
      jest.spyOn(prisma.category, "count").mockResolvedValue(0);
      jest
        .spyOn(prisma.categoryGroup, "delete")
        .mockResolvedValue(mockGroup as never);

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
        .mockResolvedValue(mockGroup as never);
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
        .mockResolvedValue(mockGroup as never);
      const newCategory = {
        id: 10,
        name: "前端",
        groupId: 1,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.category, "create")
        .mockResolvedValue(newCategory as never);

      // Act
      const result = await service.createCategory(1, { name: "前端" });

      // Assert
      expect(result.name).toBe("前端");
      expect(result.parentId).toBeNull();
    });

    it("指定合法 parentId 时成功创建子分类节点", async () => {
      // Arrange
      const parentCategory = {
        id: 1,
        name: "前端",
        groupId: 1,
        parentId: null,
      };
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup as never);
      jest
        .spyOn(prisma.category, "findUnique")
        .mockResolvedValue(parentCategory as never);
      const newCategory = {
        id: 11,
        name: "Vue",
        groupId: 1,
        parentId: 1,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.category, "create")
        .mockResolvedValue(newCategory as never);

      // Act
      const result = await service.createCategory(1, {
        name: "Vue",
        parentId: 1,
      });

      // Assert
      expect(result.parentId).toBe(1);
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
        .mockResolvedValue(mockGroup as never);
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
      };
      jest
        .spyOn(prisma.categoryGroup, "findUnique")
        .mockResolvedValue(mockGroup as never);
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
        .mockResolvedValue(mockGroup as never);
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
    const mockCategory = { id: 1, name: "前端", groupId: 1, parentId: null };

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
    it("成功删除叶节点且无题目关联的分类", async () => {
      // Arrange
      const leafCategory = {
        id: 3,
        name: "框架",
        groupId: 1,
        parentId: 1,
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
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    it("分类节点不存在时抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.category, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteCategory(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("分类有子节点时拒绝删除并抛出 BadRequestException", async () => {
      // Arrange
      const categoryWithChildren = {
        id: 1,
        name: "前端",
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
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it("分类已关联题目时拒绝删除并抛出 BadRequestException", async () => {
      // Arrange
      const categoryWithQuestions = {
        id: 3,
        name: "框架",
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
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });
});
