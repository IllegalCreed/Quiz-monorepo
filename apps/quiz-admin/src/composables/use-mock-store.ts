/**
 * Mock 模式管理 Composable
 * 通过 VITE_MOCK 环境变量控制
 */
import { ref } from 'vue'

export function useMockStore() {
  const isMock = ref(import.meta.env.VITE_MOCK === 'true' || false)

  /**
   * 设置 Mock 模式
   */
  function setMock(v: boolean) {
    isMock.value = v
  }

  return { isMock, setMock }
}
