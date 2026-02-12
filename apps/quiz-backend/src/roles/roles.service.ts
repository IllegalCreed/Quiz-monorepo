import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

/**
 * 角色服务
 * 处理角色的 CRUD 操作和业务规则
 */
@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取所有角色
   * @returns 角色列表
   */
  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { admins: true },
        },
      },
    });
  }

  /**
   * 根据 ID 获取角色
   * @param id - 角色 ID
   * @returns 角色信息
   */
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { admins: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 创建角色
   * @param createRoleDto - 角色数据
   * @returns 新创建的角色
   */
  async create(createRoleDto: CreateRoleDto) {
    // 检查角色名称是否已存在
    const existing = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new BadRequestException(`角色名称 "${createRoleDto.name}" 已存在`);
    }

    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        isSystem: createRoleDto.isSystem,
        menuPermissions: createRoleDto.menuPermissions,
        apiPermissions: createRoleDto.apiPermissions,
      },
    });
  }

  /**
   * 更新角色
   * @param id - 角色 ID
   * @param updateRoleDto - 更新数据
   * @returns 更新后的角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    // 检查角色是否存在
    const role = await this.findOne(id);

    // 保护规则：超级管理员角色（ID:1）不可修改
    if (role.id === 1) {
      throw new ForbiddenException("超级管理员角色不可修改");
    }

    // 保护规则：系统内置角色不可修改
    if (role.isSystem) {
      throw new ForbiddenException("系统内置角色不可修改");
    }

    // 如果要修改名称，检查新名称是否已被占用
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (existing) {
        throw new BadRequestException(
          `角色名称 "${updateRoleDto.name}" 已存在`,
        );
      }
    }

    // 只更新提供的字段
    const updateData: {
      name?: string;
      description?: string;
      isSystem?: boolean;
      menuPermissions?: string[];
      apiPermissions?: string[];
    } = {};

    if (updateRoleDto.name !== undefined) {
      updateData.name = updateRoleDto.name;
    }
    if (updateRoleDto.description !== undefined) {
      updateData.description = updateRoleDto.description;
    }
    if (updateRoleDto.isSystem !== undefined) {
      updateData.isSystem = updateRoleDto.isSystem;
    }
    if (updateRoleDto.menuPermissions !== undefined) {
      updateData.menuPermissions = updateRoleDto.menuPermissions;
    }
    if (updateRoleDto.apiPermissions !== undefined) {
      updateData.apiPermissions = updateRoleDto.apiPermissions;
    }

    return this.prisma.role.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除角色
   * @param id - 角色 ID
   * @returns 删除结果
   */
  async remove(id: number) {
    // 检查角色是否存在
    const role = await this.findOne(id);

    // 保护规则：超级管理员角色（ID:1）不可删除
    if (role.id === 1) {
      throw new ForbiddenException("超级管理员角色不可删除");
    }

    // 保护规则：系统内置角色不可删除
    if (role.isSystem) {
      throw new ForbiddenException("系统内置角色不可删除");
    }

    // 保护规则：检查是否有管理员正在使用该角色
    const adminCount = await this.prisma.admin.count({
      where: { roleId: id },
    });

    if (adminCount > 0) {
      throw new BadRequestException(
        `该角色正被 ${adminCount} 个管理员使用，无法删除`,
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: "角色删除成功" };
  }
}
