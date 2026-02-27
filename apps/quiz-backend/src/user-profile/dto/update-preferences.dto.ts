import { IsArray, IsInt } from "class-validator";

/**
 * 更新用户偏好分类 DTO
 * 传入完整的分类 ID 列表，替换用户现有偏好
 */
export class UpdatePreferencesDto {
  /** 分类 ID 列表（仅叶子节点） */
  @IsArray()
  @IsInt({ each: true })
  categoryIds!: number[];
}
