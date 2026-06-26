# CryptoAlert PWA — راهنمای نصب روی GitHub Pages

## ساختار فایل‌ها

```
crypto-pwa/
├── index.html       ← اپ اصلی (PWA-ready)
├── manifest.json    ← تنظیمات PWA
├── sw.js            ← Service Worker (کش آفلاین)
├── 404.html         ← ریدایرکت SPA برای GitHub Pages
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## آپلود روی GitHub Pages

### روش ۱ — آپلود مستقیم (ساده‌ترین)

1. یک **repo جدید** در GitHub بسازید (مثلاً `crypto-alerts`)
2. همه فایل‌های این پوشه را آپلود کنید
3. برو به **Settings → Pages**
4. زیر **Source** گزینه `Deploy from a branch` را انتخاب کنید
5. Branch: `main` → Folder: `/ (root)` → **Save**
6. چند دقیقه صبر کنید → آدرس اپ: `https://USERNAME.github.io/crypto-alerts/`

### روش ۲ — با Git CLI

```bash
git init
git add .
git commit -m "Initial CryptoAlert PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/crypto-alerts.git
git push -u origin main
```

سپس GitHub Pages را از Settings فعال کنید.

---

## نکته مهم برای زیرمجموعه (مثلاً `/crypto-alerts/`)

اگر اپ در **زیرمسیر** (نه root) نصب شود، باید در `sw.js` و `manifest.json` 
آدرس‌ها را تنظیم کنید:

**manifest.json:**
```json
"start_url": "/crypto-alerts/",
```

**sw.js:**
```js
const STATIC_ASSETS = [
  '/crypto-alerts/',
  '/crypto-alerts/index.html',
  ...
];
```

## نصب به عنوان اپ (PWA Install)

- **اندروید Chrome**: منوی ⋮ → «Add to Home screen»
- **iOS Safari**: دکمه Share → «Add to Home Screen»
- **دسکتاپ Chrome/Edge**: آیکون نصب در نوار آدرس

## ویژگی‌های PWA

- ✅ کار آفلاین (با Service Worker)
- ✅ نصب روی موبایل و دسکتاپ
- ✅ آیکون‌های همه سایزها
- ✅ Splash screen اتوماتیک
- ✅ کش CDN (lightweight-charts, emailjs)
- ✅ Push notification ready
