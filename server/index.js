require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://localhost:3000,https://your-vercel-app.vercel.app'
).split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked Origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests' },
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10kb' }));

// MongoDB Schema
const recruitSchema = new mongoose.Schema({
  pubgName: { type: String, required: true, maxlength: 50 },
  pubgUid: { type: String, required: true, maxlength: 20 },
  age: { type: Number, required: true, min: 14, max: 50 },
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

// Professional Gaming Email HTML
function createEmailHtml(data) {
  const rankIcons = {
    'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇',
    'Platinum': '💎', 'Diamond': '💠', 'Crown': '👑', 'Ace': '⚔️', 'Conqueror': '🏆'
  };
  const rankIcon = rankIcons[data.rank] || '⭐';
  
  let socialHtml = '';
  if (data.discord || data.tiktok) {
    socialHtml = '<tr><td style="padding:20px 30px;background:#0f0f0f"><table width="100%" cellpadding="0" cellspacing="0"><tr>';
    if (data.discord) {
      socialHtml += '<td style="padding:10px 15px;background:#5865F2;border-radius:8px;color:#fff;font-size:12px;font-weight:600">💬 ' + data.discord + '</td>';
    }
    if (data.tiktok) {
      socialHtml += '<td style="padding:10px 15px;background:#000;border-radius:8px;color:#fff;font-size:12px;font-weight:600;margin-left:10px">🎵 @' + data.tiktok + '</td>';
    }
    socialHtml += '</tr></table></td></tr>';
  }
  
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>K9x Esports</title></head>' +
'<body style="margin:0;padding:0;background:#050505;font-family:\'Rajdhani\',sans-serif">' +
'<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">' +
'<tr><td align="center" style="padding:40px 20px">' +
'<div style="max-width:620px;background:#0f0f0f;border-radius:16px;overflow:hidden;border:1px solid #1a1a1a;box-shadow:0 0 60px rgba(250,204,21,0.1)">' +
'<!-- Header -->' +
'<div style="background:linear-gradient(180deg,#111,#0d0d0d);padding:40px 35px 30px;text-align:center;position:relative">' +
'<div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,#CF0921,#CF0921 33%,#FACC15,#FACC15 66%,#006B3D,#006B3D)"></div>' +
'<div style="font-family:\'Orbitron\',sans-serif;font-size:38px;font-weight:800;color:#FACC15;letter-spacing:6px;text-shadow:0 0 30px rgba(250,204,21,0.4)">★ <span style="color:#fff">K9x</span></div>' +
'<div style="color:#666;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin-top:6px">Ghana & Nigeria Premier Esports</div>' +
'<div style="display:inline-block;margin-top:25px;padding:10px 25px;background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.3);border-radius:30px">' +
'<span style="font-size:14px;margin-right:8px">⚔️</span><span style="color:#FACC15;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase">New Recruit</span>' +
'</div></div>' +
'<!-- Alert -->' +
'<div style="background:linear-gradient(90deg,rgba(207,9,33,0.15),rgba(250,204,21,0.15),rgba(0,107,61,0.15));padding:15px;text-align:center">' +
'<div style="color:#FACC15;font-size:13px;font-weight:600">🎮 ' + data.pubgName + ' wants to join K9x!</div>' +
'</div>' +
'<!-- Content -->' +
'<div style="padding:30px 35px">' +
'<div style="color:#888;font-size:15px;line-height:1.6;margin-bottom:25px">A new player is requesting to join the elite K9x roster.</div>' +
'<!-- Player Card -->' +
'<div style="background:linear-gradient(180deg,#141414,#0f0f0f);border-radius:12px;overflow:hidden;border:1px solid #1f1f1f">' +
'<div style="background:linear-gradient(90deg,#CF0921,#FACC15,#006B3D);padding:12px 25px">' +
'<div style="color:#000;font-family:\'Orbitron\',sans-serif;font-size:13px;font-weight:700;letter-spacing:2px">PLAYER STATS</div>' +
'</div>' +
'<div style="padding:25px">' +
'<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
'<td style="padding:15px;background:#1a1a1a;border-radius:8px;border:1px solid #222;width:50%"><div style="color:#555;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">PUBG NAME</div><div style="color:#fff;font-size:16px;font-weight:700">' + data.pubgName + '</div></td>' +
'<td style="padding:15px;background:#1a1a1a;border-radius:8px;border:1px solid #222;width:50%"><div style="color:#555;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">PUBG UID</div><div style="color:#fff;font-size:16px;font-weight:700">' + data.pubgUid + '</div></td>' +
'</tr><tr>' +
'<td style="padding:15px;background:#1a1a1a;border-radius:8px;border:1px solid #222;width:50%"><div style="color:#555;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">AGE</div><div style="color:#fff;font-size:16px;font-weight:700">' + data.age + '</div></td>' +
'<td style="padding:15px;background:#1a1a1a;border-radius:8px;border:1px solid #222;width:50%"><div style="color:#555;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">DEVICE</div><div style="color:#fff;font-size:16px;font-weight:700">' + data.device + '</div></td>' +
'</tr></table>' +
'<div style="margin-top:20px;padding:15px;background:#1a1a1a;border-radius:8px;border:1px solid #222"><div style="color:#555;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">CURRENT RANK</div><div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#FACC15,#006B3D);padding:8px 18px;border-radius:25px"><span style="font-size:16px">' + rankIcon + '</span><span style="color:#000;font-size:15px;font-weight:800">' + data.rank + '</span></div></div>' +
'<!-- Quote -->' +
'<div style="margin-top:20px;padding:20px;background:rgba(250,204,21,0.05);border-radius:10px;border-left:3px solid #FACC15"><div style="color:#FACC15;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">💙 WHY K9x?</div><div style="color:#aaa;font-size:14px;font-style:italic;line-height:1.6">"' + data.why + '"</div></div>' +
socialHtml +
'<!-- Contact -->' +
'<div style="margin-top:25px;padding:20px;background:linear-gradient(135deg,rgba(37,211,102,0.1),rgba(37,211,102,0.05));border-radius:10px;border:1px solid rgba(37,211,102,0.3);text-align:center"><div style="color:#25D366;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">📱 WHATSAPP</div><div style="color:#fff;font-size:18px;font-weight:700">' + data.whatsapp + '</div></div>' +
'</div></div></div>' +
'<!-- Footer -->' +
'<div style="padding:25px;text-align:center;background:#080808;border-top:1px solid #151515"><div style="font-family:\'Orbitron\',sans-serif;color:#FACC15;font-size:18px;font-weight:700;letter-spacing:3px">★ K9x ESPORTS</div><div style="color:#444;font-size:11px;margin-top:6px">Rise As Champions</div></div>' +
'</div></td></tr></table>' +
'</body></html>';
}

// Sanitize input
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 100).replace(/[<>]/g, '');
}

// API Routes
const validateApplication = [
  body('pubgName').trim().notEmpty().isLength({ max: 50 }),
  body('pubgUid').trim().notEmpty().isLength({ max: 20 }),
  body('age').isInt({ min: 14, max: 50 }),
  body('rank').isIn(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror']),
  body('device').trim().notEmpty().isLength({ max: 50 }),
  body('whatsapp').trim().notEmpty().isLength({ max: 20 }),
  body('discord').optional().trim().isLength({ max: 50 }),
  body('tiktok').optional().trim().isLength({ max: 30 }),
  body('why').trim().notEmpty().isLength({ max: 500 }),
];

app.post('/api/apply', validateApplication, async (req, res) => {
  console.log('Incoming application:', req.body);

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());

      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      pubgName,
      pubgUid,
      age,
      rank,
      device,
      whatsapp,
      discord,
      tiktok,
      why
    } = req.body;

    const recruit = new Recruit({
      pubgName: sanitizeInput(pubgName),
      pubgUid: sanitizeInput(pubgUid),
      age: Number(age),
      rank,
      device: sanitizeInput(device),
      whatsapp: sanitizeInput(whatsapp),
      discord: sanitizeInput(discord) || undefined,
      tiktok: sanitizeInput(tiktok) || undefined,
      why: sanitizeInput(why)
    });

    await recruit.save();

    console.log('Saved:', recruit._id);

    if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_EMAIL,
          to: process.env.GMAIL_EMAIL,
          subject: `⚔️ ${pubgName} [${rank}] - K9x Application`,
          html: createEmailHtml({
            pubgName,
            pubgUid,
            age,
            rank,
            device,
            whatsapp,
            discord,
    
            why
          })
        });

        console.log('Email sent');
      } catch (mailError) {
        console.error('Email Error:', mailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted!'
    });

  } catch (error) {
    console.error('Apply Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'K9x API is running'
  });
});
app.listen(PORT, () => {
  console.log('K9x Server running on http://localhost:' + PORT);
});
