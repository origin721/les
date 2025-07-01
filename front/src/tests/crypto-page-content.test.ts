import { expect, test, beforeEach, vi, describe } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/svelte";
import CryptoPage from "../pages/crypto_page/ui/CryptoPage.svelte";
import { apiKeysStore } from "../stores/api_keys_store";
import { get } from "svelte/store";

// Мокаем криптографические функции
vi.mock("../core/crypt", () => ({
  generate_keys_curve25519: vi.fn().mockResolvedValue({
    publicKey: "test_public_key_64_chars_long_hex_string_for_curve25519_testing",
    privateKey: "test_private_key_64_chars_long_hex_string_for_curve25519_testing"
  })
}));

// Мокаем функцию копирования в буфер обмена
vi.mock("../core/clip", () => ({
  copyTextToClipboard: vi.fn().mockResolvedValue(undefined)
}));

// Мокаем валидацию
vi.mock("../core/validation", () => ({
  validateKeyName: vi.fn().mockReturnValue({ isValid: true }),
  validateCurve25519PublicKey: vi.fn().mockReturnValue({ isValid: true })
}));

// Мокаем роутинг
vi.mock("../routing", () => ({
  Link: vi.fn().mockImplementation(({ children, ...props }) => children),
  ROUTES: { HOME: "/" }
}));

// Мокаем ThemeSwitcher
vi.mock("../components/ThemeSwitcher.svelte", () => ({
  default: vi.fn().mockImplementation(() => ({ $$: {} }))
}));

// Мокаем стили
vi.mock("../styles/button", () => ({
  btn: "btn-class"
}));

// Мокаем CSS файлы
vi.mock("../styles/cyberpunk.css", () => ({}));
vi.mock("../styles/watchdogs.css", () => ({}));
vi.mock("../styles/pixel.css", () => ({}));

describe("CryptoPage с data-widget-name='CryptoPage'", () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    apiKeysStore.clearAll();
    vi.clearAllMocks();
  });

  test("находит элемент с data-widget-name='CryptoPage'", () => {
    const { container } = render(CryptoPage);
    
    const cryptoPageElement = container.querySelector('[data-widget-name="CryptoPage"]');
    expect(cryptoPageElement).toBeTruthy();
    expect(cryptoPageElement?.tagName.toLowerCase()).toBe('div');
  });

  test("отображает crypto-content область", () => {
    const { container } = render(CryptoPage);
    
    const cryptoContent = container.querySelector('.crypto-content');
    expect(cryptoContent).toBeTruthy();
  });

  test("переключается на вкладку KEYS и отображает управление ключами", async () => {
    const { container } = render(CryptoPage);
    
    // Проверяем, что по умолчанию открыта вкладка KEYS
    const keysTab = container.querySelector('[title*="Генерация и управление"]');
    expect(keysTab).toBeTruthy();
    expect(keysTab?.classList.contains('active')).toBe(true);
    
    // Проверяем наличие области crypto-content
    const cryptoContent = container.querySelector('.crypto-content');
    expect(cryptoContent).toBeTruthy();
  });

  test("генерирует новую пару ключей в crypto-content", async () => {
    const { container } = render(CryptoPage);
    
    // Находим поле ввода названия ключа
    const keyNameInput = container.querySelector('input[placeholder*="название для нового ключа"]') as HTMLInputElement;
    expect(keyNameInput).toBeTruthy();
    
    // Вводим название ключа
    await fireEvent.input(keyNameInput, { target: { value: "Тестовый ключ" } });
    expect(keyNameInput.value).toBe("Тестовый ключ");
    
    // Находим кнопку генерации
    const generateButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes("Сгенерировать"));
    expect(generateButton).toBeTruthy();
    
    // Кликаем на кнопку генерации
    await fireEvent.click(generateButton!);
    
    // Ждем обновления UI
    await waitFor(() => {
      // Проверяем, что ключ добавился в store
      const store = get(apiKeysStore);
      expect(store.myKeys.length).toBe(1);
      expect(store.myKeys[0].name).toBe("Тестовый ключ");
    });
  });

  test("добавляет ключ партнера в crypto-content", async () => {
    const { container } = render(CryptoPage);
    
    // Находим поля для добавления ключа партнера
    const partnerNameInput = container.querySelector('input[placeholder*="имя партнера"]') as HTMLInputElement;
    const partnerKeyInput = container.querySelector('textarea[placeholder*="публичный ключ партнера"]') as HTMLTextAreaElement;
    
    expect(partnerNameInput).toBeTruthy();
    expect(partnerKeyInput).toBeTruthy();
    
    // Заполняем данные партнера
    await fireEvent.input(partnerNameInput, { target: { value: "Партнер Тест" } });
    await fireEvent.input(partnerKeyInput, { target: { value: "test_partner_public_key_64_chars_long_hex_string_for_testing" } });
    
    expect(partnerNameInput.value).toBe("Партнер Тест");
    expect(partnerKeyInput.value).toBe("test_partner_public_key_64_chars_long_hex_string_for_testing");
    
    // Находим кнопку добавления ключа партнера
    const addPartnerButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes("Добавить ключ партнера"));
    expect(addPartnerButton).toBeTruthy();
    
    // Кликаем на кнопку добавления
    await fireEvent.click(addPartnerButton!);
    
    // Проверяем, что ключ партнера добавился
    await waitFor(() => {
      const store = get(apiKeysStore);
      expect(store.partnerKeys.length).toBe(1);
      expect(store.partnerKeys[0].name).toBe("Партнер Тест");
    });
  });

  test("отображает сгенерированные ключи в crypto-content", async () => {
    // Добавляем тестовый ключ в store
    apiKeysStore.addMyKey({
      name: "Тестовый ключ",
      publicKey: "test_public_key_display",
      privateKey: "test_private_key_display",
      createdAt: new Date()
    });
    
    const { container } = render(CryptoPage);
    
    // Проверяем отображение ключа
    await waitFor(() => {
      const keyName = Array.from(container.querySelectorAll('h3')).find(h3 => 
        h3.textContent?.includes("Тестовый ключ"));
      expect(keyName).toBeTruthy();
      
      // Проверяем отображение публичного ключа
      const publicKeyInput = Array.from(container.querySelectorAll('input[readonly]')).find(input => 
        (input as HTMLInputElement).value === "test_public_key_display");
      expect(publicKeyInput).toBeTruthy();
    });
  });

  test("переключается между вкладками в crypto-content", async () => {
    const { container } = render(CryptoPage);
    
    // Находим вкладку шифрования
    const encryptTab = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes("ШИФРОВАНИЕ"));
    expect(encryptTab).toBeTruthy();
    
    // Кликаем на вкладку шифрования
    await fireEvent.click(encryptTab!);
    
    // Проверяем, что вкладка стала активной
    await waitFor(() => {
      expect(encryptTab?.classList.contains('active')).toBe(true);
    });
    
    // Проверяем изменение заголовка в crypto-content
    const sectionTitle = container.querySelector('.section-title');
    expect(sectionTitle?.textContent).toContain("ШИФРОВАНИЕ");
  });

  test("проверяет правильную работу страницы после добавления ключей", async () => {
    const { container } = render(CryptoPage);
    
    // Генерируем ключ
    const keyNameInput = container.querySelector('input[placeholder*="название для нового ключа"]') as HTMLInputElement;
    await fireEvent.input(keyNameInput, { target: { value: "Рабочий ключ" } });
    
    const generateButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes("Сгенерировать"));
    await fireEvent.click(generateButton!);
    
    // Добавляем ключ партнера
    const partnerNameInput = container.querySelector('input[placeholder*="имя партнера"]') as HTMLInputElement;
    const partnerKeyInput = container.querySelector('textarea[placeholder*="публичный ключ партнера"]') as HTMLTextAreaElement;
    
    await fireEvent.input(partnerNameInput, { target: { value: "Рабочий партнер" } });
    await fireEvent.input(partnerKeyInput, { target: { value: "working_partner_key_64_chars_long_hex_string_for_testing_work" } });
    
    const addPartnerButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes("Добавить ключ партнера"));
    await fireEvent.click(addPartnerButton!);
    
    // Проверяем, что страница корректно отработала
    await waitFor(() => {
      const store = get(apiKeysStore);
      
      // Проверяем наличие обоих ключей
      expect(store.myKeys.length).toBe(1);
      expect(store.partnerKeys.length).toBe(1);
      
      // Проверяем корректность данных
      expect(store.myKeys[0].name).toBe("Рабочий ключ");
      expect(store.partnerKeys[0].name).toBe("Рабочий партнер");
      
      // Проверяем, что элементы отображаются в crypto-content
      const cryptoContent = container.querySelector('.crypto-content');
      expect(cryptoContent).toBeTruthy();
      
      // Проверяем счетчики ключей
      const myKeysSection = Array.from(container.querySelectorAll('h2')).find(h2 => 
        h2.textContent?.includes("Мои ключи"));
      expect(myKeysSection?.textContent).toContain("(1)");
      
      const partnerKeysSection = Array.from(container.querySelectorAll('h2')).find(h2 => 
        h2.textContent?.includes("Ключи партнеров"));
      expect(partnerKeysSection?.textContent).toContain("(1)");
    });
  });

  test("проверяет функциональность кнопок копирования", async () => {
    // Добавляем тестовый ключ
    apiKeysStore.addMyKey({
      name: "Ключ для копирования",
      publicKey: "copy_test_public_key",
      privateKey: "copy_test_private_key",
      createdAt: new Date()
    });
    
    const { container } = render(CryptoPage);
    
    await waitFor(() => {
      // Находим кнопки копирования
      const copyButtons = Array.from(container.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes("Копировать"));
      
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  test("проверяет удаление ключей", async () => {
    // Добавляем тестовые ключи
    apiKeysStore.addMyKey({
      name: "Ключ для удаления",
      publicKey: "delete_test_public_key",
      privateKey: "delete_test_private_key",
      createdAt: new Date()
    });
    
    const { container } = render(CryptoPage);
    
    // Мокаем confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    await waitFor(() => {
      // Находим кнопку удаления
      const deleteButton = Array.from(container.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes("Удалить"));
      expect(deleteButton).toBeTruthy();
      
      // Кликаем на удаление
      fireEvent.click(deleteButton!);
      
      // Проверяем, что ключ удален
      const store = get(apiKeysStore);
      expect(store.myKeys.length).toBe(0);
    });
    
    confirmSpy.mockRestore();
  });
});
