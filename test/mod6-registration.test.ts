import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerTools } from "../src/tools";
import { registerCli } from "../src/cli";

type AnyFn = (...args: any[]) => any;

interface CapturedTool {
  definition: {
    name: string;
    execute: (toolCallId: string, params: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
  meta: { name: string };
}

interface CapturedCli {
  factory: (ctx: { program: FakeProgram }) => void;
  meta: { commands: string[] };
}

interface FakeCommand {
  run?: AnyFn;
}

class FakeProgram {
  public commands = new Map<string, FakeCommand>();

  command(name: string) {
    const commandState: FakeCommand = {};
    this.commands.set(name, commandState);

    const chain = {
      argument: (_arg: string, _desc: string) => chain,
      option: (_flag: string, _desc: string, _defaultValue?: string) => chain,
      description: (_text: string) => chain,
      action: (handler: AnyFn) => {
        commandState.run = handler;
        return chain;
      },
    };

    return chain;
  }
}

function createApiMock() {
  const capturedTools: CapturedTool[] = [];
  let capturedCli: CapturedCli | undefined;

  const api = {
    log: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    registerTool: vi.fn((definition: CapturedTool["definition"], meta: CapturedTool["meta"]) => {
      capturedTools.push({ definition, meta });
    }),
    registerCli: vi.fn((factory: CapturedCli["factory"], meta: CapturedCli["meta"]) => {
      capturedCli = { factory, meta };
    }),
  };

  return {
    api,
    capturedTools,
    getCapturedCli: () => capturedCli,
  };
}

describe("MOD6: tool/cli 注册冒烟测试", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registerTools 应注册 4 个工具且名称正确", () => {
    const { api, capturedTools } = createApiMock();

    registerTools(api, {
      getStore: async () => undefined,
      getRetriever: async () => undefined,
    });

    const names = capturedTools.map((t) => t.definition.name);
    expect(names).toEqual([
      "memory_recall",
      "memory_store",
      "memory_forget",
      "memory_stats",
    ]);

    expect(capturedTools.map((t) => t.meta.name)).toEqual(names);
  });

  it("已注册工具在未初始化依赖时应返回友好错误，不抛异常", async () => {
    const { api, capturedTools } = createApiMock();

    registerTools(api, {
      getStore: async () => undefined,
      getRetriever: async () => undefined,
    });

    const recall = capturedTools.find((t) => t.definition.name === "memory_recall")!;
    const store = capturedTools.find((t) => t.definition.name === "memory_store")!;

    const recallResult = await recall.definition.execute("tc-1", { query: "test query" });
    const storeResult = await store.definition.execute("tc-2", {
      content: "记住：测试用内容",
      category: "fact",
    });

    expect(recallResult.success).toBe(false);
    expect(recallResult.error).toBe("Memory system not initialized");

    expect(storeResult.success).toBe(false);
    expect(storeResult.error).toBe("Memory system not initialized");
  });

  it("registerCli 应注册 6 个命令且可挂载到 program", async () => {
    const { api, getCapturedCli } = createApiMock();

    registerCli(api, {
      getStore: async () => undefined,
      getRetriever: async () => undefined,
      getCompactor: async () => undefined,
    });

    const capturedCli = getCapturedCli();
    expect(capturedCli).toBeDefined();
    expect(capturedCli!.meta.commands).toEqual([
      "search",
      "stats",
      "compact",
      "export",
      "import",
      "conflicts",
    ]);

    const program = new FakeProgram();
    capturedCli!.factory({ program });

    const commandNames = Array.from(program.commands.keys());
    expect(commandNames).toEqual([
      "search",
      "stats",
      "compact",
      "export",
      "import",
      "conflicts",
    ]);

    // 在依赖未初始化时执行命令，验证不崩溃。
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await program.commands.get("search")!.run?.("hello", { limit: "3" });
    expect(errorSpy).toHaveBeenCalled();
  });
});
