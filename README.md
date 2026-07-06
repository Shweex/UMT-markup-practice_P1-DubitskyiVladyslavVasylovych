# Flora — UMT Markup Practice P1

Лендинг квіткового магазину. Верстка за макетом Figma, mobile-first + інтерактивний шар (скоуп 2).

**Сайт:** https://shweex.github.io/UMT-markup-practice_P1-DubitskyiVladyslavVasylovych/  
**Репозиторій:** https://github.com/Shweex/UMT-markup-practice_P1-DubitskyiVladyslavVasylovych  
**Backend:** https://github.com/Shweex/UMT-markup-practice_P1-DubitskyiVladyslavVasylovych-back  
**API:** https://flora-api-qtqi.onrender.com/api/bouquets  
**Swagger:** https://flora-api-qtqi.onrender.com/api-docs  
**Макет:** https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?node-id=8211-116360

## Файли

- `index.html` — розмітка
- `css/styles.css` — стилі
- `js/` — модулі (меню, модалки, API, каталог)
- `db.json` — дані для json-server
- `images/` — фото (+ `images/retina/` для адаптивної ретинізації)
- `icons/` — логотипи, favicon, SVG-спрайт

## Запуск

### 1. Статична сторінка

Відкрийте `index.html` через локальний сервер (наприклад, Live Server у VS Code).

### 2. API (production backend)

Каталог і топ-букети завантажуються з Render API:

**https://flora-api-qtqi.onrender.com/api/bouquets**

Відгуки (testimonials) — з локального `db.json` / `js/data.js`.

**Backend repo:** https://github.com/Shweex/UMT-markup-practice_P1-DubitskyiVladyslavVasylovych-back  
**Swagger:** https://flora-api-qtqi.onrender.com/api-docs

### 3. Локальний json-server (опційно)

```bash
npm install
npm run server
```

### 3. Ретина-зображення

Для перегенерації `images/retina/` та `@2x`:

```bash
python scripts/generate-retina.py
```

## Реалізовано (скоуп 2)

- Ретинізація: `srcset` для `<img>`, `min-resolution: 2dppx` для hero
- Модалки товару та замовлення (`is-open`, бекдроп, закриття)
- Форма підписки у футері + форма заявки в модалці
- SVG-чекбокс ліцензійної угоди
- axios + async/await + json-server
- Динамічні списки через шаблонні рядки та `insertAdjacentHTML`
- Load more + пошук у каталозі, стан у `js/state.js`

## Перевірка

- https://validator.w3.org/
- https://jigsaw.w3.org/css-validator/
- DevTools → Network (перевірка Retina при зміні DPR)
