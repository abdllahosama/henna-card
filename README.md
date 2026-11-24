# دعوة ليلة حنة عبدالله & منار

نفس فكرة دعوة الفرح (ظرف بختم، عد تنازلي، تقويم، لوكيشن، دفتر تهاني) من غير حجز كراسي.

- **الإعدادات:** كلها في `js/config.js` (التاريخ، الوقت، المكان، لينك اللوكيشن)
- **التهاني:** متربطة بنفس شيت الفرح، وبتظهر في الدعوتين، وتقدر تخفي أي تهنئة بخانة "إخفاء" زي الفرح
- **كود الشيت:** موجود في مشروع الفرح `wedding card/rsvp/google-apps-script.js`
- **التصميم:** `css/style.css` نسخة من ملف الفرح، و`css/henna.css` فيه ألوان الحنة والأجزاء الخاصة بيها
- **لينكات بأسماء الضيوف:** `/links.html` زي الفرح

## الرفع على GitHub Pages
```bash
gh repo create henna-card --public --source=. --remote=origin --push
```
وبعدين Settings ← Pages ← Branch: `main` / root
اللينك: https://abdllahosama.github.io/henna-card/
