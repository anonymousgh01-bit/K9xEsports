function Navbar({ onJoinClick }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div className="logo-icon">
          <span className="logo-star">★</span>
        </div>
        <span className="logo-text">K9x</span>
      </div>
      <button className="nav-btn" onClick={onJoinClick}>
        Join Now
      </button>
    </nav>
  );
}

export default Navbar;