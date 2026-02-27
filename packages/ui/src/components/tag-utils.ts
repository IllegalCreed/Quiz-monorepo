/**
 * Tag 相关工具函数和类型
 */

/** 预设颜色列表 */
export const TAG_COLORS = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "cyan",
] as const;

/** 颜色类型 */
export type TagColor = (typeof TAG_COLORS)[number] | "default";

/**
 * 根据字符串内容确定性分配颜色
 *
 * 同一文本始终得到同一颜色，用于分类标签自动着色
 */
export function getTagColor(text: string): TagColor {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]!;
}
