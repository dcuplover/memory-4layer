import { describe, it, expect, vi } from "vitest";

vi.mock("../src/store", async () => {
  const actual = await vi.importActual<typeof import("../src/store")>("../src/store");
  return {
    ...actual,
    initializeStore: vi.fn(async () => {
      throw new Error("initializeStore should not be called in registrationOnly mode");
    }),
  };
});

import definition from "../index";
import { initializeStore } from "../src/store";

describe("index.register with registrationOnly=true", () => {
  it("should register MOD6 and stop before heavy initialization and hooks", () => {
    const api = {
      pluginConfig: {
        enabled: true,
        registrationOnly: true,
        embedding: {
          apiKey: "test-key",
        },
      },
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      registerTool: vi.fn(),
      registerCli: vi.fn(),
      on: vi.fn(),
      registerHook: vi.fn(),
      registerService: vi.fn(),
    };

    (definition as { register: (a: any) => void }).register(api);

    expect(api.registerTool).toHaveBeenCalledTimes(4);
    expect(api.registerCli).toHaveBeenCalledTimes(1);

    expect(api.on).not.toHaveBeenCalled();
    expect(api.registerHook).not.toHaveBeenCalled();
    expect(api.registerService).not.toHaveBeenCalled();

    expect(vi.mocked(initializeStore)).not.toHaveBeenCalled();
  });
});
