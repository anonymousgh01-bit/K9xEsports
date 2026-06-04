import { useState, useEffect } from 'react';

function Background() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: Math.random() * 5 + 6,
        size: Math.random() * 2 + 1
      }))
    );
  }, []);

  return (
    <div className="bg-wrapper">
      {/* Independence Square Image */}
      <div className="bg-image"></div>
      
      {/* Dark Overlay */}
      <div className="bg-overlay"></div>
      
      {/* Animated Grid */}
      <div className="cyber-grid"></div>
      
      {/* Ghana Color Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      {/* Particles */}
      <div className="particles-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle-dot"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>
      
      {/* Vignette Effect */}
      <div className="vignette"></div>
    </div>
  );
}

export default Background;