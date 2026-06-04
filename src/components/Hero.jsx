function Hero({ onJoinClick }) {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="flag-icon">⚔️</span>
        <span>Ghana's Elite Force</span>
      </div>
      
      <h1 className="hero-title">
        <span className="line">Rise As</span>
        <span className="line highlight">Champions</span>
      </h1>
      
      <p className="hero-subtitle">
        Represent Ghana on the global stage. Join the premier PUBG Mobile 
        esports organization. Compete, conquer, and bring glory to the homeland.
      </p>
      
      <div className="hero-cta">
        <button className="btn-primary" onClick={onJoinClick}>
          Join K9x
        </button>
      </div>
    </section>
  );
}

export default Hero;