function Features() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Pro Training",
      desc: "Daily practice sessions with professional coaches to sharpen your skills."
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a5 5 0 11-10 0 5 5 0 0110 0z" />
        </svg>
      ),
      title: "Team Structure",
      desc: "Join a competitive squad with defined roles and team strategy."
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Tournament Wins",
      desc: "Compete in regional and international cups for prizes and glory."
    }
  ];

  return (
    <section className="features">
      <div className="section-header">
        <h2>Why Join K9x</h2>
        <p>Your path to esports greatness starts here</p>
      </div>
      
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;