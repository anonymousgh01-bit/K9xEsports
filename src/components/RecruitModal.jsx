import { useState } from 'react';

function RecruitModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>&times;</button>

        {!isSuccess ? (
          <>
            <div className="modal-header">
              <h2>Join The Team</h2>
              <p>Become part of Ghana's finest PUBG Mobile roster</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="PUBG Mobile Name" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="PUBG UID" 
                    pattern="[0-9]{8,}"
                    title="UID must be at least 8 digits"
                    required 
                  />
                </div>

                <div className="form-group">
                  <select className="form-select" required>
                    <option value="" disabled>Select Country</option>
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>

                <div className="form-group">
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Age" 
                    min="16" 
                    max="40" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <select className="form-select" required>
                    <option value="" disabled>Current Rank</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Crown">Crown</option>
                    <option value="Ace">Ace</option>
                    <option value="Conqueror">Conqueror</option>
                  </select>
                </div>

                <div className="form-group">
                  <select className="form-select" required>
                    <option value="" disabled>Device</option>
                    <option value="Phone">Phone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Emulator">Emulator</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="WhatsApp Number" 
                    required 
                  />
                </div>

                <div className="form-group full-width">
                  <textarea 
                    className="form-input" 
                    placeholder="Why do you want to join K9x?" 
                    required
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h3>Welcome to K9x!</h3>
            <p>Your application has been received. We'll contact you soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruitModal;