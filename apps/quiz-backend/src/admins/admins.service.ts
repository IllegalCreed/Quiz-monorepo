import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminRoleDto } from "./dto/update-admin-role.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

/**
 * 管理员服务
 * 处理管理员的 CRUD 操作和业务规则
 */
@Injectable()
export class AdminsService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取所有管理员
   * @returns 管理员列表
   */
  async findAll() {
    const admins = await this.prisma.admin.findMany({
      include: { role: true },
      orderBy: { id: "asc" },
    });

    // 移除密码字段
    return admins.map((admin) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...adminWithoutPassword } = admin;
      return {
        ...adminWithoutPassword,
        role: admin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
        roleName: admin.role.name,
      };
    });
  }

  /**
   * 根据 ID 获取管理员
   * @param id - 管理员 ID
   * @returns 管理员信息
   */
  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!admin) {
      throw new NotFoundException(`管理员 ID ${id} 不存在`);
    }

    // 移除密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = admin;
    return {
      ...adminWithoutPassword,
      role: admin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
      roleName: admin.role.name,
    };
  }

  /**
   * 创建管理员
   * @param createAdminDto - 管理员数据
   * @returns 新创建的管理员
   */
  async create(createAdminDto: CreateAdminDto) {
    // 检查用户名是否已存在
    const existing = await this.prisma.admin.findUnique({
      where: { username: createAdminDto.username },
    });

    if (existing) {
      throw new BadRequestException(
        `用户名 "${createAdminDto.username}" 已存在`,
      );
    }

    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { id: createAdminDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${createAdminDto.roleId} 不存在`);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(
      createAdminDto.password,
      this.SALT_ROUNDS,
    );

    const admin = await this.prisma.admin.create({
      data: {
        username: createAdminDto.username,
        password: hashedPassword,
        nickname: createAdminDto.nickname,
        roleId: createAdminDto.roleId,
        status: "ACTIVE",
      },
      include: { role: true },
    });

    // 移除密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = admin;
    return {
      ...adminWithoutPassword,
      role: admin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
      roleName: admin.role.name,
    };
  }

  /**
   * 更新管理员角色
   * @param id - 管理员 ID
   * @param updateAdminRoleDto - 新角色信息
   * @returns 更新后的管理员
   */
  async updateRole(id: number, updateAdminRoleDto: UpdateAdminRoleDto) {
    // 检查管理员是否存在
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`管理员 ID ${id} 不存在`);
    }

    // 保护规则：超级管理员账号（ID:1）的角色不可修改
    if (admin.id === 1) {
      throw new ForbiddenException("超级管理员账号的角色不可修改");
    }

    // 检查新角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { id: updateAdminRoleDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(
        `角色 ID ${updateAdminRoleDto.roleId} 不存在`,
      );
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: { roleId: updateAdminRoleDto.roleId },
      include: { role: true },
    });

    // 移除密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = updatedAdmin;
    return {
      ...adminWithoutPassword,
      role: updatedAdmin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
      roleName: updatedAdmin.role.name,
    };
  }

  /**
   * 修改当前登录管理员的密码
   * @param adminId - 当前管理员 ID（从 JWT 中取）
   * @param dto - 当前密码 + 新密码
   */
  async changeMyPassword(
    adminId: number,
    dto: ChangePasswordDto,
  ): Promise<void> {
    // 查出含密码字段的完整记录
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException(`管理员 ID ${adminId} 不存在`);
    }

    // 验证当前密码
    const isMatch = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!isMatch) {
      throw new BadRequestException("当前密码错误");
    }

    // 新密码不能与当前密码相同
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException("新密码不能与当前密码相同");
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });
  }

  /**
   * 删除管理员
   * @param id - 管理员 ID
   * @returns 删除结果
   */
  async remove(id: number) {
    // 检查管理员是否存在
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`管理员 ID ${id} 不存在`);
    }

    // 保护规则：超级管理员账号（ID:1）不可删除
    if (admin.id === 1) {
      throw new ForbiddenException("超级管理员账号不可删除");
    }

    await this.prisma.admin.delete({
      where: { id },
    });

    return { message: "管理员删除成功" };
  }
}
