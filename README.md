# צ'אט בוט — הסטודיו לאימונים אישיים

צ'אט בוט שירות לקוחות עם Claude API, כולל backend שמחביא את מפתח ה-API בצד השרת.

## מבנה הפרויקט

```
├── index.html        # ממשק הצ'אט (frontend)
├── api/chat.js        # פונקציית שרת (Vercel Serverless Function) — כאן נמצא בסיס הידע והפרומפט
├── package.json
├── vercel.json
├── .gitignore
└── .env.example
```

## שלב 1 — קבלת מפתח API

היכנסו ל-[console.anthropic.com](https://console.anthropic.com), צרו מפתח API חדש ושמרו אותו בצד — תצטרכו אותו בשלב 3.

## שלב 2 — העלאה ל-GitHub

```bash
cd studio-chatbot-vercel
git init
git add .
git commit -m "Initial commit — studio chatbot"
git branch -M main
git remote add origin https://github.com/<your-username>/studio-chatbot.git
git push -u origin main
```

(אפשר גם ליצור את הריפו קודם באתר GitHub ואז לעקוב אחר ההוראות שם.)

## שלב 3 — פריסה ב-Vercel

1. היכנסו ל-[vercel.com](https://vercel.com) והתחברו עם GitHub
2. "Add New… → Project" ובחרו את הריפו שיצרתם
3. Vercel יזהה אוטומטית שמדובר בפרויקט סטטי + Serverless Functions — אין צורך לשנות הגדרות build
4. **חשוב:** לפני הלחיצה על Deploy (או אחריה, ב-Settings → Environment Variables), הוסיפו משתנה סביבה:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** המפתח שיצרתם בשלב 1
5. לחצו Deploy

תוך דקה תקבלו כתובת חיה כמו `studio-chatbot.vercel.app`.

## פיתוח מקומי (אופציונלי)

```bash
npm install -g vercel
vercel dev
```

זה ידרוש קובץ `.env.local` עם `ANTHROPIC_API_KEY=...` (העתיקו מ-`.env.example`).

## עדכון בסיס הידע

כל המידע העסקי (שעות, מחירים, מדיניות ביטולים וכו') נמצא בקובץ `api/chat.js`, בתוך המשתנה `SYSTEM_PROMPT`. לעדכון — ערכו את הטקסט שם, בצעו commit ו-push, ו-Vercel יפרוס אוטומטית גרסה חדשה.

## אבטחה

מפתח ה-API **אף פעם** לא נמצא בקוד ה-frontend (`index.html`) — הוא חי רק כמשתנה סביבה בצד השרת של Vercel, ונקרא רק מתוך `api/chat.js`. כך הוא לא נחשף למי שצופה בקוד המקור בדפדפן.
