import { useState, useEffect } from 'react';
import axios from 'axios';

const BillingRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchRates = () => {
    setLoading(true);
    axios.get('/rates')
      .then(res => setRates(res.data))
      .catch(() => setMsg('Failed to load rates.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRates(); }, []);

  const startEdit = (rate) => {
    setEditingId(rate.tier_id);
    setEditForm({
      tierName: rate.tier_name,
      minUsage: rate.min_usage_m3,
      maxUsage: rate.max_usage_m3 ?? '',
      costPerM3: rate.cost_per_m3,
      effectiveDate: rate.effective_date?.substring(0, 10),
    });
    setMsg('');
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await axios.put(`/rates/${id}`, editForm);
      setMsg('✅ Rate updated successfully.');
      setEditingId(null);
      fetchRates();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Update failed.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Billing Rates</h2>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Configure the block tariff structure for water usage. Click Edit to modify a rate tier.
      </p>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem',
          background: msg.startsWith('✅') ? '#e3fcef' : '#ffe3e3',
          color: msg.startsWith('✅') ? '#0f8a4f' : '#ff4242'
        }}>{msg}</div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-color)', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Tier Name</th>
            <th style={{ padding: '1rem' }}>Min Usage (m³)</th>
            <th style={{ padding: '1rem' }}>Max Usage (m³)</th>
            <th style={{ padding: '1rem' }}>Cost per m³ (M)</th>
            <th style={{ padding: '1rem' }}>Effective Date</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading rates...</td></tr>
          ) : rates.map(t => (
            <tr key={t.tier_id} style={{ borderBottom: '1px solid #eee' }}>
              {editingId === t.tier_id ? (
                <>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input value={editForm.tierName} onChange={e => setEditForm({ ...editForm, tierName: e.target.value })} style={{ padding: '0.4rem' }} />
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input type="number" value={editForm.minUsage} onChange={e => setEditForm({ ...editForm, minUsage: e.target.value })} style={{ padding: '0.4rem', width: '80px' }} />
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input type="number" value={editForm.maxUsage} placeholder="null = unlimited" onChange={e => setEditForm({ ...editForm, maxUsage: e.target.value })} style={{ padding: '0.4rem', width: '100px' }} />
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input type="number" step="0.01" value={editForm.costPerM3} onChange={e => setEditForm({ ...editForm, costPerM3: e.target.value })} style={{ padding: '0.4rem', width: '80px' }} />
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input type="date" value={editForm.effectiveDate} onChange={e => setEditForm({ ...editForm, effectiveDate: e.target.value })} style={{ padding: '0.4rem' }} />
                  </td>
                  <td style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }} onClick={() => saveEdit(t.tier_id)} disabled={saving}>
                      {saving ? '...' : 'Save'}
                    </button>
                    <button className="btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.tier_name}</td>
                  <td style={{ padding: '1rem' }}>{parseFloat(t.min_usage_m3).toFixed(0)}</td>
                  <td style={{ padding: '1rem' }}>{t.max_usage_m3 != null ? parseFloat(t.max_usage_m3).toFixed(0) : '∞'}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>M {parseFloat(t.cost_per_m3).toFixed(2)}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t.effective_date?.substring(0, 10)}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={() => startEdit(t)}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ padding: '1rem', backgroundColor: '#fdf7e3', borderLeft: '4px solid #feca57', borderRadius: '4px' }}>
        <strong>Note:</strong> Changes to billing rates will only apply to bills generated <em>after</em> the effective date. Existing bills are not recalculated.
      </div>
    </div>
  );
};

export default BillingRates;
