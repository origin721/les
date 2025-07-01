import { expect, test } from "vitest";
import CryptoPageEncrypt from "../pages/crypto_page/ui/CryptoPageEncrypt.svelte";

test("компонент CryptoPageEncrypt импортируется", () => {
    expect(CryptoPageEncrypt).toBeDefined();
});
