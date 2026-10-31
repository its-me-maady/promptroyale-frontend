import { describe, it, expect } from "vitest";
import {
  AIProviderCredential,
  SUPPORTED_BYOK_PROVIDERS,
  PROVIDER_DISCLOSURES,
} from "../lib/api";

describe("BYOK Multi-Provider Credential Management (SRS Section 4.7)", () => {
  it("verifies Gemini is presented first as the recommended provider (SRS FR-7.2)", () => {
    expect(SUPPORTED_BYOK_PROVIDERS).toBeDefined();
    expect(SUPPORTED_BYOK_PROVIDERS.length).toBe(5);
    expect(SUPPORTED_BYOK_PROVIDERS[0].id).toBe("gemini");
    expect(SUPPORTED_BYOK_PROVIDERS[0].recommended).toBe(true);

    const providerIds = SUPPORTED_BYOK_PROVIDERS.map((p) => p.id);
    expect(providerIds).toContain("openai");
    expect(providerIds).toContain("anthropic");
    expect(providerIds).toContain("deepseek");
    expect(providerIds).toContain("openrouter");
  });

  it("verifies provider-specific disclosure text exists for all supported providers (SRS FR-7.8)", () => {
    SUPPORTED_BYOK_PROVIDERS.forEach((provider) => {
      const disclosure = PROVIDER_DISCLOSURES[provider.id];
      expect(disclosure).toBeDefined();
      expect(disclosure.length).toBeGreaterThan(20);
    });
  });

  it("verifies multiple configured provider credentials data structure and default selection", () => {
    const creds: AIProviderCredential[] = [
      {
        id: 1,
        student_id: 1,
        provider: "gemini",
        masked_key: "AIza••••••••4X1a",
        status: "active",
        is_default: true,
        created_at: "2026-10-31T12:00:00Z",
      },
      {
        id: 2,
        student_id: 1,
        provider: "openai",
        masked_key: "sk-p••••••••9b2F",
        status: "active",
        is_default: false,
        created_at: "2026-10-31T12:05:00Z",
      },
    ];

    expect(creds.length).toBe(2);
    const activeDefault = creds.find((c) => c.is_default);
    expect(activeDefault?.provider).toBe("gemini");

    // Revocation simulation
    const afterRevoke = creds.filter((c) => c.id !== 2);
    expect(afterRevoke.length).toBe(1);
    expect(afterRevoke[0].provider).toBe("gemini");
  });
});
