import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      <section style={{
        background: 'linear-gradient(rgba(3, 4, 94, 0.7), rgba(0, 119, 182, 0.7)), url("https://images.unsplash.com/photo-1541252273165-bcffcb1ba71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80") center/cover',
        color: 'var(--white)',
        padding: '8rem 5%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '3.5rem', color: 'var(--white)', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          Managing Your Water, Simplified.
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', opacity: 0.9 }}>
          Experience hassle-free water management with WASCO. View bills, make payments, and report leakages all in one place.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Login</Link>
          <Link to="/register" style={{ 
            backgroundColor: 'transparent', border: '2px solid var(--white)', color: 'var(--white)',
            padding: '1rem 2rem', borderRadius: 'var(--border-radius)', fontWeight: 500, fontSize: '1.1rem' 
          }}>Register</Link>
        </div>
      </section>

      <section id="services" style={{ padding: '5rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2>Our Services</h2>
          <p style={{ color: 'var(--text-muted)' }}>Everything you need for your water account.</p>
        </div>
        <div className="grid-3 animate-fade-in">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3>View Bills</h3>
            <p style={{ color: 'var(--text-muted)' }}>Easily access and download your detailed monthly water consumption statements.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
            <h3>Pay Online</h3>
            <p style={{ color: 'var(--text-muted)' }}>Securely pay your water bills using M-Pesa, Ecocash, or Bank Transfer.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💧</div>
            <h3>Report Leakage</h3>
            <p style={{ color: 'var(--text-muted)' }}>Help us conserve water by rapidly reporting leakages in your area.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
