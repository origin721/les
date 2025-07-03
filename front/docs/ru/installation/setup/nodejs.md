# 📦 Установка Node.js

**[📋 ← Установка](../index.md)** | **[🔧 ← Общие инструкции](../common.md)** | **[📥 → Git](git.md)**

Подробная инструкция по установке Node.js для всех платформ.

## 🌐 Официальный способ

### 1. Скачивание с сайта
1. Перейдите на [nodejs.org](https://nodejs.org/)
2. Скачайте **LTS версию** (рекомендуется)
3. Установите следуя инструкциям для вашей ОС

### 2. Проверка установки
```bash
node --version    # должно показать v18+ или v20+
npm --version     # должно показать v8+ или v10+
```

## 🪟 Windows

### Способ 1: Официальный установщик
1. Скачайте `.msi` файл с [nodejs.org](https://nodejs.org/)
2. Запустите установщик
3. Следуйте инструкциям (оставьте все по умолчанию)
4. **Перезагрузите компьютер**

### Способ 2: Chocolatey
```powershell
# Установка через Chocolatey (если установлен)
choco install nodejs

# Проверка
node --version
```

### Способ 3: Winget
```powershell
# Установка через winget (Windows 10/11)
winget install OpenJS.NodeJS

# Проверка
node --version
```

## 🍎 macOS

### Способ 1: Homebrew (рекомендуется)
```bash
# Установка Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Node.js
brew install node

# Проверка
node --version
```

### Способ 2: Официальный установщик
1. Скачайте `.pkg` файл с [nodejs.org](https://nodejs.org/)
2. Запустите установщик
3. Следуйте инструкциям

### Способ 3: MacPorts
```bash
# Установка через MacPorts
sudo port install nodejs18 +universal

# Проверка
node --version
```

## 🐧 Linux

### Ubuntu/Debian
```bash
# Способ 1: Через NodeSource (рекомендуется)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Способ 2: Через snap
sudo snap install node --classic

# Способ 3: Стандартный репозиторий (может быть устаревшая версия)
sudo apt update
sudo apt install nodejs npm

# Проверка
node --version
npm --version
```

### Fedora/CentOS/RHEL
```bash
# Способ 1: Через NodeSource
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install nodejs npm

# Способ 2: Стандартный репозиторий
sudo dnf install nodejs npm

# Проверка
node --version
npm --version
```

### Arch Linux
```bash
# Установка через pacman
sudo pacman -S nodejs npm

# Проверка
node --version
npm --version
```

## 📱 Android (Termux)

```bash
# Обновление пакетов
apt update
apt upgrade -y

# Установка Node.js
apt install nodejs

# Проверка
node --version
npm --version
```

## 🔧 Версии и менеджеры

### Node Version Manager (nvm)

#### Linux/macOS
```bash
# Установка nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезапуск терминала или:
source ~/.bashrc

# Установка последней LTS версии
nvm install --lts
nvm use --lts

# Проверка
node --version
```

#### Windows (nvm-windows)
1. Скачайте с [github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)
2. Установите `nvm-setup.zip`
3. Откройте новую командную строку как администратор:

```cmd
# Установка последней LTS
nvm install lts
nvm use lts

# Проверка
node --version
```

### Volta (альтернатива nvm)
```bash
# Установка Volta
curl https://get.volta.sh | bash

# Установка Node.js
volta install node

# Проверка
node --version
```

## ❗ Решение проблем

### Проблемы с правами (Linux/macOS)
```bash
# Изменение владельца npm директории
sudo chown -R $(whoami) ~/.npm

# Или настройка глобальной директории npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Старая версия Node.js
```bash
# Удаление старой версии (Ubuntu/Debian)
sudo apt remove nodejs npm
sudo apt autoremove

# Установка новой версии через NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Проблемы с npm
```bash
# Переустановка npm
npm install -g npm@latest

# Очистка кэша
npm cache clean --force

# Проверка конфигурации
npm config list
```

### Windows: PATH не найден
1. Перезагрузите компьютер
2. Проверьте переменные окружения:
   - Откройте "Система" → "Дополнительные параметры"
   - "Переменные среды"
   - Убедитесь что путь к Node.js добавлен в PATH

## ✅ Финальная проверка

После установки выполните:

```bash
# Проверка версий
node --version     # v18.0.0 или выше
npm --version      # v8.0.0 или выше

# Проверка npm
npm list -g --depth=0

# Тестовая установка пакета
npm install -g cowsay
cowsay "Node.js установлен!"
```

---

**Следующий шаг:** [Установка Git](git.md) или [Общие инструкции](../common.md)
