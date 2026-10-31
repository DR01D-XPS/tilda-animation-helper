# Tilda Animation Helper

Chrome-расширение для генерации CSS/JS анимаций для проектов Tilda (Zero Block).

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Сгенерировать иконки (один раз)
```bash
node generate-icons.js
```

### 3. Собрать расширение
```bash
npm run build
```

### 4. Загрузить в Chrome
1. Открыть `chrome://extensions`
2. Включить **Developer mode** (переключатель вверху справа)
3. Нажать **Load unpacked**
4. Выбрать папку `dist`

### 5. Использование
- Перейдите на страницу Tilda (редактор или опубликованная страница)
- Нажмите иконку расширения **T** в тулбаре браузера
- Или нажмите **Alt+Shift+T** для переключения панели

---

## Архитектура

```
src/
├── background/
│   └── serviceWorker.ts      — MV3 Service Worker, обрабатывает клик по иконке
├── content/
│   ├── contentScript.ts      — Точка входа, монтирует React в Shadow DOM
│   ├── pageScanner.ts        — Сканирует DOM, находит Tilda элементы
│   ├── elementPicker.ts      — Режим выбора элемента мышкой с подсветкой
│   ├── selectorBuilder.ts    — Строит стабильные CSS-селекторы
│   ├── tildaParser.ts        — Парсинг Zero Block / .tn-elem структуры
│   └── shadowDomMount.ts     — Создаёт Shadow DOM контейнер
├── generator/
│   ├── presets.ts            — 13 пресетов анимаций, детектор из текста
│   ├── animationGenerator.ts — Генерация CSS/JS кода для каждого пресета
│   ├── aiProvider.ts         — Mock AI + интерфейс для реального AI API
│   └── promptBuilder.ts      — Построитель промптов для Claude/OpenAI
├── ui/
│   ├── App.tsx               — Главный React-компонент, управление состоянием
│   ├── panelStyles.ts        — CSS панели как TS-строка (для Shadow DOM)
│   └── components/
│       ├── ElementList.tsx   — Список найденных элементов
│       ├── ElementPreview.tsx — Детали выбранного элемента
│       ├── CodeOutput.tsx    — Вывод CSS/JS с кнопками копирования
│       └── History.tsx       — История генераций
└── utils/
    ├── storage.ts            — chrome.storage.local wrapper
    ├── clipboard.ts          — Копирование в буфер
    └── domUtils.ts           — DOM утилиты
```

### Технические решения
- **Shadow DOM** — полная изоляция CSS панели от Tilda
- **TypeScript + React 18 + Vite 5** — надёжный стек, быстрая сборка
- **Mock AI Provider** — работает без API-ключа, готов к замене
- **MV3 compliant** — Manifest V3, Service Worker вместо background pages

---

## Пресеты анимаций

| ID | Название | Тип | Нужен JS |
|----|----------|-----|----------|
| `fade-up` | Появление снизу | entrance | ✓ |
| `fade-in` | Плавное появление | entrance | ✓ |
| `slide-left` | Въезд справа | entrance | ✓ |
| `slide-right` | Въезд слева | entrance | ✓ |
| `scale-in` | Увеличение | entrance | ✓ |
| `parallax-scroll` | Параллакс | scroll | ✓ |
| `floating-loop` | Плавание | loop | — |
| `hover-lift` | Подъём при hover | hover | ✓ |
| `text-reveal` | Раскрытие текста | entrance | ✓ |
| `stagger-animation` | Последовательное появление | group | ✓ |
| `background-blur-glow` | Свечение/размытие | entrance | ✓ |
| `smooth-image-zoom` | Зум изображения | entrance | ✓ |
| `scroll-pin` | Фиксация при скролле | scroll | ✓ |

---

## Подключение AI API

Файл `src/generator/aiProvider.ts` содержит метки `AI_INTEGRATION_POINT`.

### Claude API (Anthropic)
```typescript
// aiProvider.ts — раскомментируйте callClaudeAPI и замените mockGenerate на:
if (provider === 'claude' && request.apiKey) {
  result = await callClaudeAPI(request);
}
```

### OpenAI
```typescript
// aiProvider.ts — раскомментируйте callOpenAIAPI
if (provider === 'openai' && request.apiKey) {
  result = await callOpenAIAPI(request);
}
```

Настройки (apiKey, модель) хранятся в `chrome.storage.local` через `src/utils/storage.ts`.

---

## Как вставлять код в Tilda

1. **Один блок страницы**: Добавить HTML-блок T123 → вставить `<style>` и `<script>`
2. **Вся страница**: Настройки страницы → SEO → HTML перед `</body>`
3. **Весь сайт**: Настройки сайта → HTML → перед `</body>` (осторожно!)

---

## Тестирование

### На Tilda
1. Откройте опубликованную страницу Tilda с Zero Block блоками
2. Активируйте панель (иконка или Alt+Shift+T)
3. Нажмите «Сканировать страницу» — должны появиться элементы
4. Выберите элемент из списка или кликом 🎯
5. Выберите пресет и нажмите «Сгенерировать код»
6. Скопируйте код и вставьте в Tilda HTML-блок

### На любой HTML-странице
Расширение работает на любом сайте. На non-Tilda страницах:
- Сканируются `h1-h6`, `img`, `button`, `a.btn` и другие элементы
- Zero Block-специфичные данные будут пустыми, но анимации работают

### Тест без Tilda (localhost)
Создайте `test.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <div id="rec123456">
    <div class="t396">
      <div class="t396__artboard">
        <div class="t396__elem tn-elem" data-elem-id="elem1">
          <div class="tn-atom t-title">Заголовок теста</div>
        </div>
        <div class="t396__elem tn-elem" data-elem-id="elem2">
          <div class="tn-atom tn-atom_btn">Кнопка теста</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## Ограничения

1. **Без Tilda API** — расширение читает только публичный DOM. В редакторе Tilda структура может отличаться от опубликованной страницы.
2. **Dynamic content** — элементы, загружаемые после DOMContentLoaded (например, через AJAX), могут не попасть в скан. Нажмите «Сканировать» повторно.
3. **nth-child селекторы** — крайний случай, помечаются как нестабильные.
4. **CSS specificity** — сгенерированный код использует добавление класса к элементу. Если Tilda перезаписывает inline-стили при ресайзе, анимации могут сбиться.
5. **Zero Block transform** — если элемент уже имеет transform (Tilda устанавливает это для позиционирования), пресеты, использующие transform, могут конфликтовать. Расширение предупреждает об этом.
6. **Mobile Zero Block** — responsive data-атрибуты (`data-field-*-res-*`) читаются, но анимации генерируются для desktop-first.
7. **AI без API** — mock-режим распознаёт ключевые слова. Для полноценного AI нужен API-ключ.

---

## Разработка

```bash
# Watch mode (пересборка при изменениях)
npm run dev

# Type checking
npm run type-check
```

После изменений: в `chrome://extensions` нажать кнопку обновления расширения (⟳).
