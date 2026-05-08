import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const districts = [
  "Maseru", "Berea", "Leribe", "Butha-Buthe", "Mokhotlong",
  "Thaba-Tseka", "Qacha's Nek", "Quthing", "Mohale's Hoek", "Mafeteng"
];

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    accountNumber: '',
    fullName: '',
    email: '',
    phone: '',
    district: '',
    physicalAddress: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      await axios.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>
      {error && (
        <div style={{ color: '#ff6b6b', background: '#ffe3e3', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label>WASCO Account Number</label>
            <input type="text" name="accountNumber" required onChange={handleChange} placeholder="e.g. ACC-10001" />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" required onChange={handleChange} placeholder="e.g. Thabo Molefe" />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" required onChange={handleChange} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" required onChange={handleChange} placeholder="+266 5000 0000" />
          </div>
        </div>

        <div className="form-group">
          <label>District</label>
          <select name="district" required onChange={handleChange}>
            <option value="">Select District...</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Physical Address</label>
          <textarea rows="2" name="physicalAddress" required onChange={handleChange} placeholder="Street, area, landmark..."></textarea>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" required onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </>
  );
};

export default Register;
