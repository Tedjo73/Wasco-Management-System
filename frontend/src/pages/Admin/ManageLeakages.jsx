import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageLeakages = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/leakages');
      setReports(res.data);
    } catch (err) {
      setError('Failed to load leakage reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await axios.patch(`/leakages/${id}/status`, { status: newStatus });
      fetchReports();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const getUrgencyColor = (u) => {
    if (u === 'High') return '#ff4242';
    if (u === 'Medium') return '#d97706';
    return '#0077B6';
  };

  const getStatusColor = (s) => {
    if (s === 'Resolved') return '#2bce89';
    if (s === 'In Progress') return '#0077B6';
    return '#666';
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Leakage Maintenance</h2>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and resolve reported water leakages</p>
        </div>
        <button className="btn-outline" onClick={fetchReports} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {error && <div className="card" style={{ color: '#ff4242', marginBottom: '1.5rem' }}>{error}</div>}

      <div className="grid-1">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,119,182,0.05)', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '1rem' }}>Ticket / Date</th>
                <th style={{ padding: '1rem' }}>Customer / District</th>
                <th style={{ padding: '1rem' }}>Location & Description</th>
                <th style={{ padding: '1rem' }}>Urgency</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.report_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>
                      LKG-{r.report_id.toString().padStart(5, '0')}
                    </div>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </small>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{r.full_name || 'Anonymous'}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{r.district || 'N/A'}</small>
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.2rem' }}>{r.location}</div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.description}
                    </small>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: getUrgencyColor(r.urgency), 
                      background: `${getUrgencyColor(r.urgency)}15`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {r.urgency}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: getStatusColor(r.status), 
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      ● {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={r.status} 
                      onChange={(e) => handleStatusChange(r.report_id, e.target.value)}
                      disabled={updating === r.report_id}
                      style={{ padding: '0.3rem', fontSize: '0.85rem', width: 'auto' }}
                    >
                      <option value="Pending">Set Pending</option>
                      <option value="In Progress">Set In Progress</option>
                      <option value="Resolved">Set Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No leakage reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageLeakages;
