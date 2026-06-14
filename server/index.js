require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// VALID VALUES (single source of truth — keep in sync with frontend)
// ========================
const VALID_RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];
const VALID_DEVICES = ['iPhone', 'Android', 'Tablet'];

// ========================
// MIDDLEWARE
// ========================
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));

// FIX: Rate limiting on the apply endpoint to prevent spam
const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 applications per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many applications from this IP. Please try again later.' }
});

// ========================
// MONGODB SCHEMA
// ========================
const recruitSchema = new mongoose.Schema({
  pubgName:  { type: String, required: true, maxlength: 50 },
  pubgUid:   { type: String, required: true, maxlength: 20 },
  age:       { type: Number, required: true, min: 16, max: 40 },
  rank:      { type: String, required: true, enum: VALID_RANKS },
  device:    { type: String, required: true, enum: VALID_DEVICES },
  whatsapp:  { type: String, required: true, maxlength: 20 },
  // FIX: why is required in the route, so mark it required in schema too
  why:       { type: String, required: true, maxlength: 500 },
  status:    { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Recruit = mongoose.model('Recruit', recruitSchema);

// ========================
// MONGODB CONNECTION (with retry)
// ========================
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
      // FIX: Retry connection instead of silently continuing
      console.error('❌ MongoDB connection failed:', err.message);
      console.log('⏳ Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

// ========================
// EMAIL
// ========================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

function createEmailHtml(data) {
  const rankIcons = {
    'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇',
    'Platinum': '💎', 'Diamond': '💠', 'Crown': '👑',
    'Ace': '⚔️', 'Conqueror': '🏆'
  };

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>K9x</title></head>
  <body style="margin:0;padding:0;background:#050505;font-family:Rajdhani,sans-serif">
  <table width="100%"><tr><td align="center" style="padding:40px 20px">
  <div style="max-width:620px;background:#0f0f0f;border-radius:16px;overflow:hidden">
  <div style="background:#111;padding:40px 35px;text-align:center;position:relative">
  <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#CF0921,#CF0921 33%,#FACC15,#FACC15 66%,#006B3D,#006B3D)"></div>
  <div style="font-family:Orbitron;font-size:38px;font-weight:800;color:#FACC15">★ K9x</div>
  <div style="color:#666;font-size:12px;margin-top:6px">Ghana Premier Esports</div>
  <div style="margin-top:25px;padding:10px 25px;background:rgba(250,204,21,0.1);border:1px solid #FACC15;border-radius:30px">
  <span style="color:#FACC15;font-weight:600">⚔️ NEW RECRUIT</span></div></div>
  <div style="padding:30px">
  <div style="color:#FACC15;font-size:18px;font-weight:600">🎮 ${data.pubgName} wants to join!</div>
  <table width="100%" style="margin-top:20px">
  <tr>
  <td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">NAME</div><div style="color:#fff;font-weight:700">${data.pubgName}</div></td>
  <td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">UID</div><div style="color:#fff;font-weight:700">${data.pubgUid}</div></td>
  </tr>
  <tr>
  <td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">AGE</div><div style="color:#fff;font-weight:700">${data.age}</div></td>
  <td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">RANK</div>
  <div style="display:inline-flex;gap:8px;background:linear-gradient(135deg,#FACC15,#006B3D);padding:8px 18px;border-radius:25px;color:#000;font-weight:700">
  ${rankIcons[data.rank] || '⭐'} ${data.rank}</div></td>
  </tr>
  </table>
  <table width="100%" style="margin-top:20px">
  <tr>
  <td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">DEVICE</div><div style="color:#fff;font-weight:700">${data.device}</div></td>
  <td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">WHATSAPP</div><div style="color:#fff;font-weight:700">${data.whatsapp}</div></td>
  </tr>
  </table>
  <div style="margin-top:20px;padding:20px;background:rgba(250,204,21,0.05);border-left:3px solid #FACC15">
  <div style="color:#FACC15;font-size:11px">WHY K9x?</div>
  <div style="color:#aaa;font-style:italic">"${data.why}"</div>
  </div>
  </div></div>
  <div style="padding:25px;text-align:center;background:#080808;color:#FACC15;font-weight:700">
  ★ K9x ESPORTS - ${new Date().toLocaleString()}</div>
  </td></tr></table></body></html>`;
}

// ========================
// SANITIZE
// FIX: maxlength now matches schema (500 for `why`, 100 for others)
// ========================
function sanitize(s, maxLen = 100) {
  if (typeof s !== 'string') return s;
  return s.trim().substring(0, maxLen).replace(/[<>]/g, '');
}

// ========================
// ROUTES
// ========================

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'K9x Backend is running!', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

// FIX: Apply rate limiter to this route
app.post('/api/apply', applyLimiter, async (req, res) => {
  try {
    const { pubgName, pubgUid, age, rank, device, whatsapp, why } = req.body;

    // FIX: Validate all required fields including age, rank, and device
    if (!pubgName || !pubgUid || !whatsapp || !why || !rank || !device || age == null) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const numAge = Number(age);
    if (isNaN(numAge) || numAge < 16 || numAge > 40) {
      return res.status(400).json({ error: 'Age must be between 16 and 40.' });
    }

    if (!VALID_RANKS.includes(rank)) {
      return res.status(400).json({ error: 'Invalid rank value.' });
    }

    if (!VALID_DEVICES.includes(device)) {
      return res.status(400).json({ error: 'Invalid device value.' });
    }

    // FIX: Sanitize all fields with correct max lengths BEFORE using them
    const sanitizedData = {
      pubgName: sanitize(pubgName, 50),
      pubgUid:  sanitize(pubgUid, 20),
      age:      numAge,
      rank,     // already validated against enum
      device,   // already validated against enum
      whatsapp: sanitize(whatsapp, 20),
      why:      sanitize(why, 500),  // FIX: was 100, now correctly 500
    };

    // Save to MongoDB
    const recruit = new Recruit(sanitizedData);
    await recruit.save();
    console.log('✅ Saved:', sanitizedData.pubgName);

    // FIX: Send email using sanitized data (not raw req.body)
    if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject: `⚔️ ${sanitizedData.pubgName} [${sanitizedData.rank}] - K9x Application`,
        html: createEmailHtml(sanitizedData)
      });
      console.log('📧 Email sent');
    }

    res.status(200).json({ success: true, message: 'Application submitted!' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
});

app.get('/api/recruits', async (req, res) => {
  try {
    const recruits = await Recruit.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(recruits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recruits.' });
  }
});

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
  console.log(`🚀 K9x Backend running on port: ${PORT}`);
});
