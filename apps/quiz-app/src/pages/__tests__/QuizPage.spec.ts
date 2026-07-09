import { nextTick, reactive, ref } from "vue";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import QuizPage from "../QuizPage.vue";

const question = ref<{
  stem: string;
  categoryNames: string[];
  options: Array<{ id: number; text: string }>;
} | null>(null);
const loading = ref(false);
const selected = ref<number | null>(null);
const status = ref<"idle" | "correct" | "wrong" | "answered">("idle");
const error = ref<string | null>(null);
const correctOptionId = ref<number | null>(null);
const optionDescriptions = ref<Record<number, string>>({});
const explanation = ref<string | null>(null);

const loadNext = vi.fn<() => Promise<void>>();
const choose = vi.fn();

const selectedIds = ref<number[]>([]);
const initCategories = vi.fn<() => Promise<void>>();
const loadUserPreferences = vi.fn<() => Promise<void>>();
const applyCategoryParam = vi.fn<(value: unknown) => boolean>();

const route = reactive<{ query: Record<string, unknown> }>({
  query: {},
});

const userStore = {
  token: "",
  userInfo: null as { id: number } | null,
  isLoggedIn: false,
  fetchUserInfo: vi.fn<() => Promise<void>>(),
};

vi.mock("../composables/useQuiz", () => ({
  useQuiz: () => ({
    question,
    loading,
    selected,
    status,
    loadNext,
    choose,
    error,
    correctOptionId,
    optionDescriptions,
    explanation,
  }),
}));

vi.mock("@/composables/useCategories", () => ({
  useCategories: () => ({
    selectedIds,
    init: initCategories,
    loadUserPreferences,
    applyCategoryParam,
  }),
}));

vi.mock("@/stores/useUserStore", () => ({
  useUserStore: () => userStore,
}));

vi.mock("vue-router", () => ({
  useRoute: () => route,
}));

vi.mock("@quiz/ui", () => ({
  BaseCard: { template: "<div><slot /></div>" },
  BaseCardHeader: { template: "<div><slot /></div>" },
  BaseCardContent: { template: "<div><slot /></div>" },
  BaseButton: { template: "<button><slot /></button>" },
  BaseTag: { template: "<span><slot /></span>" },
  CheckRadioGroup: { template: "<div />" },
  getTagColor: () => "default",
}));

vi.mock("@/components/LoginPrompt.vue", () => ({
  default: { template: "<div />" },
}));

describe("QuizPage", () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    question.value = null;
    loading.value = false;
    selected.value = null;
    status.value = "idle";
    error.value = null;
    correctOptionId.value = null;
    optionDescriptions.value = {};
    explanation.value = null;

    selectedIds.value = [];
    loadNext.mockReset().mockResolvedValue(undefined);
    choose.mockReset();
    applyCategoryParam.mockReset().mockReturnValue(false);
    route.query = {};

    initCategories.mockReset().mockImplementation(async () => {
      selectedIds.value = [1];
    });
    loadUserPreferences.mockReset().mockImplementation(async () => {
      selectedIds.value = [2];
    });

    userStore.token = "";
    userStore.userInfo = null;
    userStore.isLoggedIn = false;
    userStore.fetchUserInfo.mockReset().mockImplementation(async () => {
      userStore.userInfo = { id: 1 };
      userStore.isLoggedIn = true;
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = "";
  });

  it("游客首次进入页面只拉取一次题目", async () => {
    wrapper = mount(QuizPage);

    await flushPromises();

    expect(initCategories).toHaveBeenCalledTimes(1);
    expect(userStore.fetchUserInfo).not.toHaveBeenCalled();
    expect(loadUserPreferences).not.toHaveBeenCalled();
    expect(loadNext).toHaveBeenCalledTimes(1);
  });

  it("已登录用户等待偏好恢复后只拉取一次题目", async () => {
    userStore.token = "jwt-token";

    wrapper = mount(QuizPage);

    await flushPromises();

    expect(initCategories).toHaveBeenCalledTimes(1);
    expect(userStore.fetchUserInfo).toHaveBeenCalledTimes(1);
    expect(loadUserPreferences).toHaveBeenCalledTimes(1);
    expect(loadNext).toHaveBeenCalledTimes(1);
  });

  it("URL 分类参数会作为临时筛选后再拉取首题", async () => {
    route.query = { category: "vitepress" };
    applyCategoryParam.mockImplementation((value) => {
      if (value === "vitepress") {
        selectedIds.value = [14];
        return true;
      }
      return false;
    });

    wrapper = mount(QuizPage);

    await flushPromises();

    expect(applyCategoryParam).toHaveBeenCalledWith("vitepress");
    expect(loadUserPreferences).not.toHaveBeenCalled();
    expect(selectedIds.value).toEqual([14]);
    expect(loadNext).toHaveBeenCalledTimes(1);
  });

  it("已登录用户带 URL 分类参数时不覆盖为后端偏好", async () => {
    userStore.token = "jwt-token";
    route.query = { category: "vitepress" };
    applyCategoryParam.mockImplementation((value) => {
      if (value === "vitepress") {
        selectedIds.value = [14];
        return true;
      }
      return false;
    });

    wrapper = mount(QuizPage);

    await flushPromises();

    expect(userStore.fetchUserInfo).toHaveBeenCalledTimes(1);
    expect(loadUserPreferences).not.toHaveBeenCalled();
    expect(selectedIds.value).toEqual([14]);
    expect(loadNext).toHaveBeenCalledTimes(1);
  });

  it("初始化完成后分类变化会重新拉题", async () => {
    wrapper = mount(QuizPage);

    await flushPromises();
    loadNext.mockClear();

    selectedIds.value = [9];
    await nextTick();
    await flushPromises();

    expect(loadNext).toHaveBeenCalledTimes(1);
  });
});
