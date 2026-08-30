// Vercel Serverless Function — POST /api/chat
// Keeps the Anthropic API key on the server. Never expose it in frontend code.

const SYSTEM_PROMPT = `אתה צ'אט בוט שירות לקוחות ומומחה שיווקי עבור סטודיו אימונים אישיים.
המטרה שלך היא לענות ללקוחות מתעניינים וקיימים בצורה אדיבה, מקצועית, מכירתית ותמציתית, ולעזור להם להבין את השירותים שלנו או לקבוע פגישת הכרות.

להלן המידע העסקי המלא של הסטודיו (זהו בסיס הידע שלך - אל תמציא מידע שלא מופיע כאן):
לסטודיו קוראים: "הסטודיו"

1. שעות פעילות:
- א'-ה' 09:00-21:00, ו' 08:00-13:00

2. כתובת ומיקום:
- שדרות התמרים 4, באר שבע

3. סוגי אימונים בסטודיו:
- אימוני כוח אישיים, TRX, פילאטיס מכשירים, קרוספיט וכו'

4. מסלולי תשלום ומחירים:
- כרטיסיית 10 אימונים בעלות של 200 ש"ח לכרטיסיה
- מנוי חודשי בעלות של 400 ש"ח
- אימון אישי 1 על 1 בעלות של 60 ש"ח

5. אמצעי תשלום:
- אשראי, ביט, מזומן, הוראת קבע

6. מדיניות ביטולים:
- ביטול אימון 1 על 1 עד 12 שעות מראש ללא עלות
- ביטול מנוי בעלות חד פעמית של 20 ש"ח
- ביטול כרטיסיה בזיכוי לפי יתרת האימונים, כאשר על כל אימון שלא נעשה יהיה החזר של 20 ש"ח

כללים:
- אם משתמש שואל שאלה שאינה מופיעה בבסיס הידע, אל תמציא תשובה. אמור לו באדיבות שהוא יכול ליצור קשר ישירות עם הסטודיו בטלפון 054-1234567, והציעו לו שיחזרו אליו.
- בסוף כל מענה רלוונטי, נסה להניע לפעולה בטבעיות (למשל: "תרצה לקבוע אימון ניסיון?" או "יש לך שאלות נוספות על המסלולים שלנו?").
- שמור על תשובות תמציתיות, ברורות וללא כותרות מיותרות.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const trimmedMessages = messages.slice(-20).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000)
  }));

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages
      })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error('Anthropic API error:', data);
      return res.status(anthropicRes.status).json({ error: 'Upstream API error' });
    }

    const replyText = (data.content || [])
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n')
      .trim();

    return res.status(200).json({ reply: replyText || 'מצטער, לא הצלחתי לענות כרגע. אפשר לנסות שוב?' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
