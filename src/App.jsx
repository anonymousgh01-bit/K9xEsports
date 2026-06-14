import { useState, useEffect, useCallback } from 'react';

const VALID_RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];
const VALID_DEVICES = ['iPhone', 'Android', 'Tablet'];
const API_URL = 'https://k9xesports.onrender.com';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void: #080B14;
    --panel: #0D1117;
    --slate: #1A2035;
    --cyan: #00F5FF;
    --magenta: #FF006E;
    --cyan-dim: rgba(0,245,255,0.12);
    --magenta-dim: rgba(255,0,110,0.12);
    --text: #E8EAF0;
    --muted: #6B7A99;
    --border: rgba(0,245,255,0.15);
  }

  body { background: var(--void); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; }

  /* ── BACKGROUND ── */
  .bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: var(--void);
  }
  .bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }
  .bg-orb-1 {
    position: absolute; width: 600px; height: 600px; border-radius: 50%;
    top: -200px; left: -200px;
    background: radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%);
    animation: orbFloat 8s ease-in-out infinite;
  }
  .bg-orb-2 {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    bottom: -150px; right: -150px;
    background: radial-gradient(circle, rgba(255,0,110,0.08) 0%, transparent 70%);
    animation: orbFloat 10s ease-in-out infinite reverse;
  }
  .scan-lines {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
    );
    pointer-events: none; opacity: 0.4;
  }
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.05); }
  }

  /* ── NAVBAR ── */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(8,11,20,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: 22px;
    letter-spacing: 3px; color: var(--cyan);
    text-shadow: 0 0 20px rgba(0,245,255,0.6);
  }
  .logo-diamond {
    width: 10px; height: 10px; background: var(--magenta);
    transform: rotate(45deg);
    box-shadow: 0 0 12px var(--magenta);
  }
  .nav-join {
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--void); background: var(--cyan);
    border: none; padding: 10px 22px; cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(0,245,255,0.3);
  }
  .nav-join:hover {
    background: #fff;
    box-shadow: 0 0 30px rgba(0,245,255,0.6);
    transform: translateY(-1px);
  }

  /* ── HERO ── */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 60px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase; color: var(--cyan);
    border: 1px solid var(--border); padding: 8px 18px;
    margin-bottom: 32px;
    background: var(--cyan-dim);
    clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
  }
  .hero-eyebrow-dot { width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; animation: blink 1.4s infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

  .hero-title {
    font-family: 'Orbitron', monospace; font-weight: 900;
    font-size: clamp(52px, 10vw, 110px); line-height: 0.9;
    letter-spacing: -2px; text-transform: uppercase;
    color: var(--text); margin-bottom: 10px;
    position: relative;
  }
  .hero-title-top {
    display: block; color: transparent;
    -webkit-text-stroke: 1.5px rgba(0,245,255,0.5);
    position: relative;
  }
  .hero-title-top::after {
    content: attr(data-text);
    position: absolute; left: 0; top: 0; width: 100%;
    color: var(--cyan);
    clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
    animation: glitch 4s infinite;
    text-shadow: 2px 0 var(--magenta);
  }
  @keyframes glitch {
    0%,90%,100% { clip-path: polygon(0 0,100% 0,100% 40%,0 40%); transform: translate(0); }
    92% { clip-path: polygon(0 20%,100% 20%,100% 50%,0 50%); transform: translate(-3px, 1px); }
    94% { clip-path: polygon(0 60%,100% 60%,100% 80%,0 80%); transform: translate(3px, -1px); }
    96% { clip-path: polygon(0 30%,100% 30%,100% 70%,0 70%); transform: translate(-2px, 0); }
  }
  .hero-title-bot {
    display: block;
    background: linear-gradient(135deg, var(--cyan) 0%, #7B9FFF 50%, var(--magenta) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 30px rgba(0,245,255,0.3));
  }

  .hero-sub {
    max-width: 520px; font-size: 16px; font-weight: 300; line-height: 1.7;
    color: var(--muted); margin: 28px auto 44px;
    letter-spacing: 0.3px;
  }
  .hero-cta {
    font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--void); background: linear-gradient(90deg, var(--cyan), #7B9FFF);
    border: none; padding: 16px 44px; cursor: pointer;
    clip-path: polygon(16px 0%, 100% 0%, calc(100% - 16px) 100%, 0% 100%);
    transition: all 0.25s;
    box-shadow: 0 0 40px rgba(0,245,255,0.25), 0 4px 20px rgba(0,0,0,0.4);
    position: relative; overflow: hidden;
  }
  .hero-cta::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: translateX(-100%); transition: transform 0.5s;
  }
  .hero-cta:hover::before { transform: translateX(100%); }
  .hero-cta:hover {
    box-shadow: 0 0 60px rgba(0,245,255,0.5), 0 4px 30px rgba(0,0,0,0.5);
    transform: translateY(-2px);
  }

  .hero-stats {
    display: flex; gap: 48px; margin-top: 64px;
    border-top: 1px solid var(--border); padding-top: 40px;
  }
  .stat { text-align: center; }
  .stat-num {
    font-family: 'Orbitron', monospace; font-size: 32px; font-weight: 900;
    color: var(--cyan); display: block;
    text-shadow: 0 0 20px rgba(0,245,255,0.5);
  }
  .stat-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-top: 4px; display: block; }

  /* ── FEATURES ── */
  .features {
    position: relative; z-index: 1;
    padding: 100px 40px; max-width: 1100px; margin: 0 auto;
  }
  .features-eyebrow {
    font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 4px;
    color: var(--magenta); text-transform: uppercase; margin-bottom: 12px;
    display: block;
  }
  .features-title {
    font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 42px);
    font-weight: 900; color: var(--text); margin-bottom: 60px;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .features-title span { color: var(--cyan); }

  .cards {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
  }
  .card {
    background: var(--panel); padding: 40px 32px;
    border: 1px solid var(--border);
    position: relative; overflow: hidden;
    transition: all 0.3s; cursor: default;
  }
  .card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--cyan-dim), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .card:hover::before { opacity: 1; }
  .card:hover { border-color: rgba(0,245,255,0.4); transform: translateY(-4px); }
  .card:hover .card-icon { text-shadow: 0 0 30px rgba(0,245,255,0.8); }

  .card-num {
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    color: var(--magenta); letter-spacing: 2px; margin-bottom: 20px; display: block;
  }
  .card-icon { font-size: 36px; margin-bottom: 20px; display: block; transition: text-shadow 0.3s; }
  .card h3 {
    font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 700;
    color: var(--text); letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 14px;
  }
  .card p { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .card-line {
    position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
    background: linear-gradient(90deg, var(--cyan), var(--magenta));
    transition: width 0.4s;
  }
  .card:hover .card-line { width: 100%; }

  /* ── MODAL ── */
  .overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(4,6,12,0.92);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--panel);
    border: 1px solid var(--border);
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    position: relative;
    animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
    clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

  .modal-top-bar {
    height: 3px;
    background: linear-gradient(90deg, var(--magenta), var(--cyan), var(--magenta));
    background-size: 200% 100%;
    animation: barShift 3s linear infinite;
  }
  @keyframes barShift { 0% { background-position: 0% 0%; } 100% { background-position: 200% 0%; } }

  .modal-inner { padding: 40px 40px 40px; }
  .modal-close {
    position: absolute; top: 20px; right: 24px;
    background: none; border: none; color: var(--muted);
    font-size: 24px; cursor: pointer; line-height: 1;
    transition: color 0.2s;
    z-index: 10;
  }
  .modal-close:hover { color: var(--cyan); }

  .modal-eyebrow {
    font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 4px;
    color: var(--magenta); text-transform: uppercase; margin-bottom: 8px;
  }
  .modal-title {
    font-family: 'Orbitron', monospace; font-size: 26px; font-weight: 900;
    color: var(--text); text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .modal-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
  .fg-full { grid-column: 1 / -1; }

  .fg { position: relative; }
  .fg input, .fg select, .fg textarea {
    width: 100%; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(0,245,255,0.15); color: var(--text);
    font-family: 'Inter', sans-serif; font-size: 14px;
    padding: 14px 14px 14px 44px;
    transition: border-color 0.2s, background 0.2s;
    outline: none; appearance: none;
  }
  .fg input::placeholder, .fg textarea::placeholder { color: transparent; }
  .fg select { color: var(--muted); }
  .fg select option { background: var(--panel); color: var(--text); }
  .fg select:valid { color: var(--text); }
  .fg textarea { resize: vertical; min-height: 90px; }

  .fg input:focus, .fg select:focus, .fg textarea:focus {
    border-color: var(--cyan); background: rgba(0,245,255,0.04);
  }

  .fg label {
    position: absolute; left: 44px; top: 50%; transform: translateY(-50%);
    font-size: 13px; color: var(--muted); pointer-events: none;
    transition: all 0.2s; background: var(--panel); padding: 0 4px;
  }
  .fg textarea ~ label { top: 16px; transform: none; }

  .fg input:focus ~ label,
  .fg input:not(:placeholder-shown) ~ label,
  .fg textarea:focus ~ label,
  .fg textarea:not(:placeholder-shown) ~ label {
    top: 0; transform: translateY(-50%); font-size: 10px;
    color: var(--cyan); letter-spacing: 1px;
  }

  .fg-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 16px; pointer-events: none;
  }
  .fg textarea ~ .fg-icon { top: 18px; transform: none; }

  /* ── SUBMIT BUTTON ── */
  .submit-btn {
    width: 100%; position: relative; overflow: hidden;
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--void); border: none; padding: 18px;
    cursor: pointer;
    clip-path: polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%);
    background: linear-gradient(90deg, var(--cyan), #7B9FFF, var(--magenta));
    background-size: 200% 100%; background-position: 0% 0%;
    transition: background-position 0.4s, box-shadow 0.3s;
    box-shadow: 0 0 30px rgba(0,245,255,0.2);
    margin-top: 8px;
  }
  .submit-btn:not(:disabled):hover {
    background-position: 100% 0%;
    box-shadow: 0 0 50px rgba(0,245,255,0.4), 0 0 20px rgba(255,0,110,0.2);
  }
  .submit-btn:disabled { cursor: not-allowed; opacity: 0.8; }

  .submit-btn.charging::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    background: rgba(255,255,255,0.3);
    animation: charge 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  @keyframes charge { from { width: 0; } to { width: 100%; } }

  .sparks { position: absolute; inset: 0; pointer-events: none; }
  .spark {
    position: absolute; width: 4px; height: 4px; border-radius: 50%;
    background: var(--cyan);
    animation: sparkFly 0.6s ease-out forwards;
    box-shadow: 0 0 6px var(--cyan);
  }
  @keyframes sparkFly {
    0% { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
  }

  .btn-text { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }

  .spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: var(--void);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── ERROR BOX ── */
  .error-box {
    margin-top: 12px; padding: 12px 16px;
    background: rgba(255,0,110,0.08);
    border: 1px solid rgba(255,0,110,0.3);
    font-size: 13px; color: #FF6B9D; line-height: 1.5;
  }
  .error-box strong { display: block; font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 2px; color: var(--magenta); margin-bottom: 4px; }

  /* ── SUCCESS ── */
  .success {
    text-align: center; padding: 20px 0 10px;
  }
  .success-ring {
    width: 80px; height: 80px; border-radius: 50%;
    border: 2px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 0 30px rgba(0,245,255,0.3), inset 0 0 20px rgba(0,245,255,0.05);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 30px rgba(0,245,255,0.3); } 50% { box-shadow: 0 0 50px rgba(0,245,255,0.5); } }
  .success-check { font-size: 36px; }
  .success h3 {
    font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 900;
    color: var(--text); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;
  }
  .success p { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .success a { color: var(--cyan); text-decoration: none; }
  .success a:hover { text-decoration: underline; }

  /* ── FOOTER ── */
  .footer {
    position: relative; z-index: 1;
    border-top: 1px solid var(--border);
    padding: 48px 40px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 20px;
  }
  .footer-logo {
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: 18px;
    letter-spacing: 3px; color: var(--cyan);
    text-shadow: 0 0 20px rgba(0,245,255,0.4);
  }
  .footer-copy { font-size: 12px; color: var(--muted); letter-spacing: 1px; }
  .footer-links { display: flex; gap: 20px; }
  .footer-link {
    font-size: 13px; color: var(--muted); text-decoration: none;
    transition: color 0.2s;
  }
  .footer-link:hover { color: var(--cyan); }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.3); border-radius: 2px; }

  @media (max-width: 700px) {
    .navbar { padding: 0 20px; }
    .hero { padding: 90px 20px 50px; }
    .hero-stats { gap: 24px; }
    .features { padding: 60px 20px; }
    .cards { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .fg-full { grid-column: 1; }
    .modal-inner { padding: 28px 24px 28px; }
    .modal { clip-path: none; }
  }
`;

function SparkParticles({ active }) {
  if (!active) return null;
  const sparks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const dist = 40 + Math.random() * 40;
    return {
      id: i,
      sx: Math.cos((angle * Math.PI) / 180) * dist + 'px',
      sy: Math.sin((angle * Math.PI) / 180) * dist + 'px',
      delay: Math.random() * 0.1,
    };
  });
  return (
    <div className="sparks">
      {sparks.map(s => (
        <div key={s.id} className="spark" style={{ '--sx': s.sx, '--sy': s.sy, left: '50%', top: '50%', animationDelay: `${s.delay}s` }} />
      ))}
    </div>
  );
}

function Navbar({ onJoin }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-diamond" />
        K9X
      </div>
      <button className="nav-join" onClick={onJoin}>Join Now</button>
    </nav>
  );
}

function Hero({ onJoin }) {
  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span className="hero-eyebrow-dot" />
        Ghana's Elite PUBG Mobile Force
      </div>
      <h1 className="hero-title">
        <span className="hero-title-top" data-text="Rise As">Rise As</span>
        <span className="hero-title-bot">Champions</span>
      </h1>
      <p className="hero-sub">
        Represent Ghana on the global stage. Join the premier PUBG Mobile esports organization. Compete, conquer, and bring glory to the homeland.
      </p>
      <button className="hero-cta" onClick={onJoin}>⚔ Join K9x Now</button>
      <div className="hero-stats">
        <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Active Players</span></div>
        <div className="stat"><span className="stat-num">12</span><span className="stat-label">Tournaments</span></div>
        <div className="stat"><span className="stat-num">#1</span><span className="stat-label">Ghana Roster</span></div>
      </div>
    </section>
  );
}

function Features() {
  const cards = [
    { num: '01', icon: '⚡', title: 'Pro Training', desc: 'Daily practice with professional coaches to sharpen every mechanic, rotation, and decision.' },
    { num: '02', icon: '🎯', title: 'Team Structure', desc: 'Join a competitive squad with defined roles, shot-callers, and battle-tested strategies.' },
    { num: '03', icon: '🏆', title: 'Tournament Wins', desc: 'Compete in regional and international cups — real prizes, real glory, real legacy.' },
  ];
  return (
    <section className="features">
      <span className="features-eyebrow">Why K9x</span>
      <h2 className="features-title">Built For <span>Greatness</span></h2>
      <div className="cards">
        {cards.map(c => (
          <div className="card" key={c.num}>
            <span className="card-num">{c.num}</span>
            <span className="card-icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <div className="card-line" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RecruitModal({ isOpen, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [charging, setCharging] = useState(false);
  const [sparks, setSparks] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setSubmitting(false);
      setCharging(false);
      setSparks(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Trigger charge + spark animation
    setCharging(true);
    setSparks(true);
    setTimeout(() => setCharging(false), 650);
    setTimeout(() => setSparks(false), 700);

    const form = e.target;
    const rawAge = Number(form.age.value);
    const rawRank = form.rank.value;
    const rawDevice = form.device.value;

    if (isNaN(rawAge) || rawAge < 16 || rawAge > 40) {
      setError({ title: 'Invalid Age', msg: 'Age must be between 16 and 40.' });
      return;
    }
    if (!VALID_RANKS.includes(rawRank)) {
      setError({ title: 'Invalid Rank', msg: 'Please select a valid rank.' });
      return;
    }
    if (!VALID_DEVICES.includes(rawDevice)) {
      setError({ title: 'Invalid Device', msg: 'Please select a valid device.' });
      return;
    }

    const formData = {
      pubgName: form.pubgName.value.trim(),
      pubgUid: form.pubgUid.value.trim(),
      age: rawAge,
      rank: rawRank,
      device: rawDevice,
      whatsapp: form.whatsapp.value.trim(),
      why: form.why.value.trim(),
    };

    setSubmitting(true);

    // Abort after 20 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_URL}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status} with no JSON body.`);
      }

      if (res.ok && result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(onClose, 2800);
      } else {
        setError({
          title: 'Submission Failed',
          msg: result.error || `Server responded with status ${res.status}.`,
        });
      }
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        setError({
          title: 'Request Timed Out',
          msg: 'The server took too long to respond. It may be waking up — please wait 30 seconds and try again.',
        });
      } else {
        setError({
          title: 'Connection Failed',
          msg: `Could not reach the server. Check your internet connection and try again.\n\nDetails: ${err.message}`,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && onClose()}>
      <div className="modal">
        <div className="modal-top-bar" />
        <div className="modal-inner">
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

          {!success ? (
            <>
              <div className="modal-eyebrow">Recruitment</div>
              <h2 className="modal-title">Join The Team</h2>
              <p className="modal-sub">Ghana's finest PUBG Mobile roster awaits</p>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="fg">
                    <input type="text" name="pubgName" placeholder=" " required />
                    <span className="fg-icon">🎮</span>
                    <label>PUBG Mobile Name</label>
                  </div>
                  <div className="fg">
                    <input type="text" name="pubgUid" placeholder=" " pattern="[0-9]{8,}" title="UID must be at least 8 digits" required />
                    <span className="fg-icon">🆔</span>
                    <label>PUBG UID</label>
                  </div>
                  <div className="fg">
                    <input type="number" name="age" placeholder=" " min="16" max="40" required />
                    <span className="fg-icon">🎂</span>
                    <label>Age</label>
                  </div>
                  <div className="fg">
                    <select name="rank" required defaultValue="">
                      <option value="" disabled>Select Rank ⭐</option>
                      {VALID_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="fg fg-full">
                    <select name="device" required defaultValue="">
                      <option value="" disabled>Select Device 📱</option>
                      {VALID_DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="fg fg-full">
                    <input type="tel" name="whatsapp" placeholder=" " required />
                    <span className="fg-icon">📞</span>
                    <label>WhatsApp Number</label>
                  </div>
                  <div className="fg fg-full">
                    <textarea name="why" placeholder=" " required />
                    <span className="fg-icon" style={{ top: 16, transform: 'none' }}>💙</span>
                    <label>Why do you want to join K9x?</label>
                  </div>
                </div>

                {error && (
                  <div className="error-box">
                    <strong>{error.title}</strong>
                    {error.msg}
                  </div>
                )}

                <button
                  type="submit"
                  className={`submit-btn${charging ? ' charging' : ''}`}
                  disabled={submitting}
                >
                  <SparkParticles active={sparks} />
                  <span className="btn-text">
                    {submitting
                      ? <><div className="spinner" /> Transmitting...</>
                      : '⚡ Submit Application'
                    }
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="success">
              <div className="success-ring">
                <span className="success-check">✓</span>
              </div>
              <h3>Welcome to K9x</h3>
              <p>
                Application received. We'll reach out via WhatsApp soon.<br /><br />
                Join our Discord for updates:{' '}
                <a href="https://discord.gg/YOUR_REAL_INVITE" target="_blank" rel="noopener noreferrer">
                  discord.gg/k9x
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">K9X ESPORTS</div>
      <p className="footer-copy">© 2026 K9x Esports. All rights reserved.</p>
      <div className="footer-links">
        <a href="https://discord.gg/YOUR_REAL_INVITE" target="_blank" rel="noopener noreferrer" className="footer-link">Discord</a>
        <a href="https://tiktok.com/@k9xesports" target="_blank" rel="noopener noreferrer" className="footer-link">TikTok</a>
        <a href="https://youtube.com/k9xEsports" target="_blank" rel="noopener noreferrer" className="footer-link">YouTube</a>
      </div>
    </footer>
  );
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const openModal = () => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [closeModal]);

  return (
    <>
      <style>{styles}</style>
      <div>
        <div className="bg">
          <div className="bg-grid" />
          <div className="bg-orb-1" />
          <div className="bg-orb-2" />
          <div className="scan-lines" />
        </div>
        <Navbar onJoin={openModal} />
        <main>
          <Hero onJoin={openModal} />
          <Features />
        </main>
        <Footer />
        <RecruitModal isOpen={modalOpen} onClose={closeModal} />
      </div>
    </>
  );
}
