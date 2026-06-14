import { useState, useEffect, useCallback } from 'react';
import './index.css';
import './App.css';

function Navbar({ onJoin }) {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <span className="logo-star">★</span>
        <span className="logo-text">K9x</span>
      </div>
      <button className="nav-btn" onClick={onJoin}>
        Join Now
      </button>
    </nav>
  );
}

function Background() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 6
    })));
  }, []);

  return (
    <div className="bg-wrapper">
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>
      <div className="cyber-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="particles-box">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>
      <div className="vignette"></div>
    </div>
  );
}

function Hero({ onJoin }) {
  return (
    <section className="hero">
      <div className="badge">
        <span>⚔️</span>
        <span>Ghana's Elite Force</span>
      </div>
      <h1 className="hero-title">
        <span className="highlight">Rise As</span>
        Champions
      </h1>
      <p className="hero-subtitle">
        Represent Ghana on the global stage. Join the premier PUBG Mobile
        esports organization. Compete, conquer, and bring glory to the homeland.
      </p>
      <button className="hero-btn" onClick={onJoin}>
        Join K9x
      </button>
    </section>
  );
}

function Features() {
  const features = [
    { icon: "⚡", title: "Pro Training", desc: "Daily practice sessions with professional coaches to sharpen your skills." },
    { icon: "🎯", title: "Team Structure", desc: "Join a competitive squad with defined roles and winning strategies." },
    { icon: "🏆", title: "Tournament Wins", desc: "Compete in regional and international cups for prizes and glory." }
  ];

  return (
    <section className="features">
      <div className="features-header">
        <h2>Why Join K9x</h2>
        <p>Your path to esports greatness starts here</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const VALID_RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];
const VALID_DEVICES = ['iPhone', 'Android', 'Tablet'];

function RecruitModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // FIX: Reset success state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;

    const rawAge = Number(form.age.value);
    const rawRank = form.rank.value;
    const rawDevice = form.device.value;

    // FIX: Client-side validation for age, rank, and device
    if (isNaN(rawAge) || rawAge < 16 || rawAge > 40) {
      alert('Age must be between 16 and 40.');
      setIsSubmitting(false);
      return;
    }
    if (!VALID_RANKS.includes(rawRank)) {
      alert('Please select a valid rank.');
      setIsSubmitting(false);
      return;
    }
    if (!VALID_DEVICES.includes(rawDevice)) {
      alert('Please select a valid device.');
      setIsSubmitting(false);
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

    try {
      const API_URL = 'https://k9xesports.onrender.com';

      const response = await fetch(`${API_URL}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        // FIX: Reset form first, then close after delay — avoids resetting unmounted form
        form.reset();
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        alert(result.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Connection Error:', error);
      alert(
        `Connection failed.\n\nPlease check your internet connection and try again.\n\nDetails: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>

        {!isSuccess ? (
          <>
            <div className="modal-header">
              <h2>Join The Team</h2>
              <p>Become part of Ghana's finest PUBG Mobile roster</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <input type="text" name="pubgName" className="form-input" placeholder=" " required />
                  <span className="input-icon">🎮</span>
                  <label className="float-label">PUBG Mobile Name</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="pubgUid"
                    className="form-input"
                    placeholder=" "
                    pattern="[0-9]{8,}"
                    title="UID must be at least 8 digits"
                    required
                  />
                  <span className="input-icon">🆔</span>
                  <label className="float-label">PUBG UID</label>
                </div>

                <div className="form-group">
                  <input
                    type="number"
                    name="age"
                    className="form-input"
                    placeholder=" "
                    min="16"
                    max="40"
                    required
                  />
                  <span className="input-icon">🎂</span>
                  <label className="float-label">Age</label>
                </div>

                <div className="form-group">
                  <select name="rank" className="form-select" required defaultValue="">
                    <option value="" disabled>Select Rank</option>
                    {VALID_RANKS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <span className="input-icon">⭐</span>
                </div>

                <div className="form-group full">
                  <select name="device" className="form-select" required defaultValue="">
                    <option value="" disabled>Select Device</option>
                    {VALID_DEVICES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="input-icon">📱</span>
                </div>

                <div className="form-group full">
                  <input type="tel" name="whatsapp" className="form-input" placeholder=" " required />
                  <i className="input-icon fab fa-whatsapp" style={{ fontSize: '16px' }}></i>
                  <label className="float-label">WhatsApp Number</label>
                </div>

                <div className="form-group full">
                  <textarea name="why" className="form-input" placeholder=" " required></textarea>
                  <span className="input-icon" style={{ top: '18px' }}>💙</span>
                  <label className="float-label">Why do you want to join K9x?</label>
                </div>
              </div>

              <button
                type="submit"
                className={`submit-btn${isSubmitting ? ' submit-btn--loading' : ''}`}
                disabled={isSubmitting}
              >
                <span className="submit-btn__text">🚀 Submit Application</span>
                <span className="submit-btn__spinner" aria-hidden="true"></span>
              </button>
            </form>
          </>
        ) : (
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h3>🎉 Welcome to K9x!</h3>
            <p>Your application has been received. We'll reach out via WhatsApp soon.</p>
            {/* FIX: Replace placeholder discord link with a real one or remove */}
            <p className="link-hint">
              Join our Discord for updates:{' '}
              <a href="https://discord.gg/YOUR_REAL_INVITE" target="_blank" rel="noopener noreferrer">
                discord.gg/k9x
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <span>★</span>
        <span>K9x ESPORTS</span>
      </div>
      <p>© 2026 K9x Esports. All rights reserved.</p>

      <div className="footer-social">
        <a href="https://discord.gg/YOUR_REAL_INVITE" target="_blank" rel="noopener noreferrer" className="social-link social-discord" title="Join Discord">
          <i className="fab fa-discord"></i>
        </a>
        <a href="https://tiktok.com/@k9xesports" target="_blank" rel="noopener noreferrer" className="social-link social-tiktok" title="Follow TikTok">
          <i className="fab fa-tiktok"></i>
        </a>
        <a href="https://youtube.com/k9xEsports" target="_blank" rel="noopener noreferrer" className="social-link social-youtube" title="YouTube Channel">
          <i className="fab fa-youtube"></i>
        </a>
      </div>
    </footer>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FIX: useCallback so closeModal is stable and safe to use in useEffect deps
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // FIX: closeModal is now stable (via useCallback), safe to include in deps array
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  return (
    <div className="app">
      <div className="flag-strip"></div>
      <Background />
      <Navbar onJoin={openModal} />
      <main>
        <Hero onJoin={openModal} />
        <Features />
      </main>
      <Footer />
      <RecruitModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

export default App;
