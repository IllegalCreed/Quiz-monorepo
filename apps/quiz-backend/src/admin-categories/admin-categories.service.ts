import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateCategoryGroupDto } from "./dto/create-category-group.dto";
import type { UpdateCategoryGroupDto } from "./dto/update-category-group.dto";
import type { CreateCategoryDto } from "./dto/create-category.dto";
import type { UpdateCategoryDto } from "./dto/update-category.dto";
import type { Category } from "@prisma/client";

/** 分类节点树形节点（递归嵌套） */
export interface CategoryTreeNode {
  id: number;
  name: string;
  sort: number;
  children: CategoryTreeNode[];
}

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取所有维度列表，每个维度包含完整的分类树
   */
  async findAllGroups() {
    const groups = await this.prisma.categoryGroup.findMany({
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
      include: {
        // 获取该维度下所有分类节点（扁平列表，后续在应用层组装为树）
        categories: {
          orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    // 将每个维度的扁平分类数组组装为树形结构
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      sort: group.sort,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      categories: this._buildTree(group.categories),
    }));
  }

  /**
   * 创建分类维度
   */
  async createGroup(dto: CreateCategoryGroupDto) {
    return this.prisma.categoryGroup.create({
      data: {
        name: dto.name,
        sort: dto.sort ?? 0,
      },
    });
  }

  /**
   * 编辑分类维度名称或排序
   */
  async updateGroup(id: number, dto: UpdateCategoryGroupDto) {
    await this._assertGroupExists(id);
    return this.prisma.categoryGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.sort !== undefined ? { sort: dto.sort } : {}),
      },
    });
  }

  /**
   * 删除分类维度（要求组内无分类节点）
   */
  async deleteGroup(id: number) {
    await this._assertGroupExists(id);
    const count = await this.prisma.category.count({ where: { groupId: id } });
    if (count > 0) {
      throw new BadRequestException(
        "该维度下仍有分类节点，请先删除所有分类后再删除维度",
      );
    }
    await this.prisma.categoryGroup.delete({ where: { id } });
    return { message: "维度删除成功" };
  }

  /**
   * 在指定维度下创建分类节点（支持指定 parentId 创建子节点）
   */
  async createCategory(groupId: number, dto: CreateCategoryDto) {
    await this._assertGroupExists(groupId);

    // 若指定了 parentId，校验父节点存在且属于同一维度
    if (dto.parentId != null) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`父节点 #${dto.parentId} 不存在`);
      }
      if (parent.groupId !== groupId) {
        throw new BadRequestException("父节点不属于当前维度");
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        groupId,
        parentId: dto.parentId ?? null,
        sort: dto.sort ?? 0,
      },
    });
  }

  /**
   * 编辑分类节点（名称、排序、父节点）
   */
  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new BadRequestException(`分类节点 #${id} 不存在`);
    }

    // 若重新挂载父节点，校验新父节点存在且属于同一维度
    if (dto.parentId != null) {
      if (dto.parentId === id) {
        throw new BadRequestException("不能将节点挂载到自身");
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`父节点 #${dto.parentId} 不存在`);
      }
      if (parent.groupId !== category.groupId) {
        throw new BadRequestException("父节点不属于当前维度");
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.sort !== undefined ? { sort: dto.sort } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
      },
    });
  }

  /**
   * 删除分类节点（要求无子节点且无题目关联）
   */
  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        questionCategories: true,
      },
    });
    if (!category) {
      throw new BadRequestException(`分类节点 #${id} 不存在`);
    }
    if (category.children.length > 0) {
      throw new BadRequestException("该分类下仍有子分类，请先删除子分类");
    }
    if (category.questionCategories.length > 0) {
      throw new BadRequestException(
        `该分类已关联 ${category.questionCategories.length} 道题目，请先解除关联`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { message: "分类删除成功" };
  }

  // ────────── 私有工具方法 ──────────

  /**
   * 将扁平分类数组递归组装为树形结构（根节点 parentId 为 null）
   */
  private _buildTree(
    categories: Category[],
    parentId: number | null = null,
  ): CategoryTreeNode[] {
    return categories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        sort: c.sort,
        children: this._buildTree(categories, c.id),
      }));
  }

  /** 断言维度存在，不存在则抛出 BadRequestException */
  private async _assertGroupExists(id: number) {
    const group = await this.prisma.categoryGroup.findUnique({ where: { id } });
    if (!group) {
      throw new BadRequestException(`维度 #${id} 不存在`);
    }
  }
}
