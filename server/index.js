require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// MongoDB Schema
const recruitSchema = new mongoose.Schema({
  pubgName: { type: String, required: true, maxlength: 50 },
  pubgUid: { type: String, required: true, maxlength: 20 },
  age: { type: Number, required: true },
  rank: { type: String, required: true },
  device: { type: String, required: true, maxlength: 50 },
  whatsapp: { type: String, required: true, maxlength: 20 },
  discord: { type: String, maxlength: 50 },
  tiktok: { type: String, maxlength: 30 },
  why: { type: String, required: true, maxlength: 500 },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Recruit = mongoose.model('Recruit', recruitSchema);

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err.message));

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Gaming Email Template
function createEmailHtml(data) {
  const r = { 'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇', 'Platinum': '💎', 'Diamond': '💠', 'Crown': '👑', 'Ace': '⚔️', 'Conqueror': '🏆' };
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>K9x</title></head>' +
  '<body style="margin:0;padding:0;background:#050505;font-family:Rajdhani,sans-serif">' +
  '<table width="100%"><tr><td align="center" style="padding:40px 20px">' +
  '<div style="max-width:620px;background:#0f0f0f;border-radius:16px;overflow:hidden">' +
  '<div style="background:#111;padding:40px 35px;text-align:center;position:relative">' +
  '<div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#CF0921,#CF0921 33%,#FACC15,#FACC15 66%,#006B3D,#006B3D)"></div>' +
  '<div style="font-family:Orbitron;font-size:38px;font-weight:800;color:#FACC15">★ K9x</div>' +
  '<div style="color:#666;font-size:12px;margin-top:6px">Ghana & Nigeria Premier Esports</div>' +
  '<div style="margin-top:25px;padding:10px 25px;background:rgba(250,204,21,0.1);border:1px solid #FACC15;border-radius:30px">' +
  '<span style="color:#FACC15;font-weight:600">⚔️ NEW RECRUIT</span></div></div>' +
  '<div style="padding:30px"><div style="color:#FACC15;font-size:18px;font-weight:600">🎮 ' + data.pubgName + ' wants to join!</div>' +
  '<table width="100%" style="margin-top:20px"><tr>' +
  '<td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">NAME</div><div style="color:#fff;font-weight:700">' + data.pubgName + '</div></td>' +
  '<td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">UID</div><div style="color:#fff;font-weight:700">' + data.pubgUid + '</div></td></tr>' +
  '<tr><td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">AGE</div><div style="color:#fff;font-weight:700">' + data.age + '</div></td>' +
  '<td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">RANK</div><div style="display:inline-flex;gap:8px;background:linear-gradient(135deg,#FACC15,#006B3D);padding:8px 18px;border-radius:25px;color:#000;font-weight:700">' + (r[data.rank] || '⭐') + ' ' + data.rank + '</div></td></tr></table>' +
  '<table width="100%" style="margin-top:20px"><tr>' +
  '<td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">DEVICE</div><div style="color:#fff;font-weight:700">' + data.device + '</div></td>' +
  '<td style="padding:15px;background:#1a1a1a;border-radius:8px"><div style="color:#555;font-size:10px">WHATSAPP</div><div style="color:#fff;font-weight:700">' + data.whatsapp + '</div></td></tr></table>' +
  (data.discord ? '<div style="margin-top:20px;padding:10px 15px;background:#5865F2;border-radius:8px;color:#fff;font-weight:600">💬 ' + data.discord + '</div>' : '') +
  (data.tiktok ? '<div style="margin-top:10px;padding:10px 15px;background:#000;border-radius:8px;color:#fff;font-weight:600">🎵 @' + data.tiktok + '</div>' : '') +
  '<div style="margin-top:20px;padding:20px;background:rgba(250,204,21,0.05);border-left:3px solid #FACC15"><div style="color:#FACC15;font-size:11px">WHY K9x?</div><div style="color:#aaa;font-style:italic">"' + data.why + '"</div></div>' +
  '</div></div>' +
  '<div style="padding:25px;text-align:center;background:#080808;color:#FACC15;font-weight:700">★ K9x ESPORTS - ' + new Date().toLocaleString() + '</div></div></td></tr></table></body></html>';
}

// Sanitize
function sanitize(s) {
  if (typeof s !== 'string') return s;
  return s.trim().substring(0, 100).replace(/[<>]/g, '');
}

// API Routes
app.post('/api/apply', async (req, res) => {
  try {
    const { pubgName, pubgUid, age, rank, device, whatsapp, discord, tiktok, why } = req.body;

    if (!pubgName || !pubgUid || !whatsapp || !why) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to MongoDB
    const recruit = new Recruit({
      pubgName: sanitize(pubgName),
      pubgUid: sanitize(pubgUid),
      age: Number(age),
      rank,
      device: sanitize(device),
      whatsapp: sanitize(whatsapp),
      discord: sanitize(discord) || undefined,
      tiktok: sanitize(tiktok) || undefined,
      why: sanitize(why),
    });
    await recruit.save();
    console.log('Saved:', pubgName);

    // Send Email
    if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject: '⚔️ ' + pubgName + ' [' + rank + '] - K9x Application',
        html: createEmailHtml({ pubgName, pubgUid, age, rank, device, whatsapp, discord, tiktok, why })
      });
      console.log('Email sent');
    }

    res.status(200).json({ success: true, message: 'Application submitted!' });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: 'Failed to submit' });
  }
});

// Get all recruits
app.get('/api/recruits', async (req, res) => {
  try {
    const recruits = await Recruit.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(recruits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log('K9x Backend running on port:', PORT);
});
