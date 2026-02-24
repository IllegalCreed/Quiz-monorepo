import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { AdminQuestionsService } from "./admin-questions.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { QueryQuestionsDto } from "./dto/query-questions.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";

/**
 * 管理员题目管理控制器
 * 所有接口需要 JWT 认证 + 对应权限
 */
@Controller("admin/questions")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminQuestionsController {
  constructor(private readonly adminQuestionsService: AdminQuestionsService) {}

  /**
   * 获取题目列表（分页、搜索、标签过滤）
   * GET /admin/questions?keyword=...&tag=...&page=1&pageSize=20
   */
  @Get()
  @RequirePermission("questions:list")
  findAll(@Query() query: QueryQuestionsDto) {
    return this.adminQuestionsService.findAll(query);
  }

  /**
   * 获取题目详情
   * GET /admin/questions/:id
   */
  @Get(":id")
  @RequirePermission("questions:list")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.adminQuestionsService.findOne(id);
  }

  /**
   * 创建题目
   * POST /admin/questions
   */
  @Post()
  @RequirePermission("questions:create")
  create(@Body() dto: CreateQuestionDto) {
    return this.adminQuestionsService.create(dto);
  }

  /**
   * 更新题目（含选项替换）
   * PATCH /admin/questions/:id
   */
  @Patch(":id")
  @RequirePermission("questions:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.adminQuestionsService.update(id, dto);
  }

  /**
   * 软删除题目（设置 deletedAt）
   * DELETE /admin/questions/:id
   */
  @Delete(":id")
  @RequirePermission("questions:delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.adminQuestionsService.remove(id);
  }
}
