/**
 * 菜单导航逻辑
 * 优先使用路由 meta.belong 指定归属菜单（详情页等子页面），
 * 否则回退到当前路径匹配
 */
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

export function useMenuNavigation() {
  const router = useRouter();
  const route = useRoute();

  /**
   * 根据路由信息计算应激活的菜单索引
   * 优先取 meta.belong，回退到 route.path
   */
  const resolveActiveIndex = (): string => {
    return route.meta.belong || route.path;
  };

  /** 当前激活的菜单索引 */
  const activeIndex = ref(resolveActiveIndex());

  /**
   * 处理菜单选择
   */
  const handleSelect = (key: string) => {
    router.push({ path: key });
  };

  /**
   * 监听路由变化,更新激活状态
   */
  watch(
    () => route.path,
    () => {
      activeIndex.value = resolveActiveIndex();
    },
  );

  return { activeIndex, handleSelect };
}
