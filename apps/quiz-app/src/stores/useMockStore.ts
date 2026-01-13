import { ref } from 'vue'

// simple mock toggle store (page-level minimal store)
export function useMockStore() {
  const isMock = ref(import.meta.env.VITE_MOCK === 'true' || false)
  function setMock(v: boolean) {
    isMock.value = v
  }
  return { isMock, setMock }
}
