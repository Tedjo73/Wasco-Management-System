import { useState } from 'react';
import { useAuth } from '../../App';
import axios from 'axios';

const ReportLeakage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    urgency: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/leakages', formData);
      setSuccess(res.data);
      setFormData({ location: '', description: '', urgency: 'Medium' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💧</div>
        <h2 style={{ color: 'var(--primary-blue)' }}>Report Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{success.message}</p>
        <div style={{ background: 'var(--bg-color)', padding: '1rem 2rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'inline-block' }}>
          <strong>Ticket Number: </strong>
          <span style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>{success.ticketNumber}</span>
        </div>
        <br />
        <button className="btn-primary" onClick={() => setSuccess(null)} style={{ marginTop: '1rem' }}>
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Report a Water Leakage</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Help us conserve water. Please provide as much detail as possible so our maintenance team can locate the issue quickly.
      </p>

      {error && (
        <div style={{ color: '#ff4242', background: '#ffe3e3', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Account Number</label>
          <input type="text" value={user?.accountNumber || '—'} disabled
            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} />
        </div>

        <div className="form-group">
          <label>Location / Address of Leakage</label>
          <input type="text" required placeholder="E.g. Near Mapetla High School, Main Road"
            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows="4" required placeholder="Describe the size and nature of the leak..."
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}>
          </textarea>
        </div>

        <div className="form-group">
          <label>Urgency Level</label>
          <select value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
            <option value="Low">Low — Small drop / seepage</option>
            <option value="Medium">Medium — Steady stream</option>
            <option value="High">High — Major pipe burst / flooding</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportLeakage;
