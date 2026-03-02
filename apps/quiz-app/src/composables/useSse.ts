/**
 * SSE 连接管理 + 心跳发送
 *
 * 模块级 singleton：所有调用者共享同一份连接状态。
 * - connect()：建立 EventSource 连接，接收服务端推送事件
 * - disconnect()：关闭连接
 * - sendHeartbeat()：通过 POST 上报当前页面和用户信息（JWT 自动注入）
 *
 * 事件处理：
 * - refresh → 页面重载
 * - announcement → 显示公告 toast（5s 自动消失）
 */
import { ref } from "vue";
import { post } from "@/utils/request";

/** API 基础地址（与 request.ts 一致） */
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:10020/api";

/** sessionStorage key（per-tab 唯一） */
const CLIENT_ID_KEY = "quiz-client-id";

/** 公告消息（响应式，App.vue 渲染 toast） */
const announcement = ref("");

/** 公告自动消失定时器 */
let announcementTimer: ReturnType<typeof setTimeout> | null = null;

/** EventSource 实例 */
let eventSource: EventSource | null = null;

/**
 * 获取或生成 per-tab 唯一 clientId
 *
 * sessionStorage 保证同一 tab 刷新不变，不同 tab 各自独立
 */
function getClientId(): string {
  let id = sessionStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function useSse() {
  /**
   * 建立 SSE 连接
   *
   * EventSource 内置自动重连，无需手动处理断线。
   * 服务端通过连接注册客户端 IP。
   */
  function connect() {
    // 避免重复连接
    if (eventSource) return;

    const clientId = getClientId();
    eventSource = new EventSource(`${BASE_URL}/clients/stream?clientId=${clientId}`);

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as {
          type: string;
          message?: string;
        };

        if (data.type === "refresh") {
          // 强制刷新页面（管理端广播）
          window.location.reload();
        } else if (data.type === "announcement" && data.message) {
          // 显示公告 toast
          announcement.value = data.message;
          if (announcementTimer) clearTimeout(announcementTimer);
          // 5 秒后自动消失
          announcementTimer = setTimeout(() => {
            announcement.value = "";
          }, 5000);
        }
      } catch {
        // 忽略解析失败（如服务端 ping 心跳）
      }
    };
  }

  /**
   * 关闭 SSE 连接
   */
  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  /**
   * 发送心跳（上报当前页面、用户信息由 JWT 自动提取）
   *
   * 失败静默忽略，不影响主流程。
   *
   * @param currentPage - 当前页面路径（默认取 window.location.pathname）
   */
  async function sendHeartbeat(currentPage?: string) {
    try {
      await post("/clients/heartbeat", {
        clientId: getClientId(),
        currentPage: currentPage ?? window.location.pathname,
      });
    } catch {
      // 心跳失败静默忽略
    }
  }

  return { announcement, connect, disconnect, sendHeartbeat };
}
