import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageBills = () => {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showGenerate, setShowGenerate] = useState(false);

  const [genForm, setGenForm] = useState({
    accountNumber: '', month: '', year: new Date().getFullYear(),
    meterPrevious: '', meterCurrent: '', dueDate: ''
  });
  const [genLoading, setGenLoading] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterStatus) params.status = filterStatus;
      
      const [billsRes, custRes] = await Promise.all([
        axios.get('/bills', { params }),
        axios.get('/customers')
      ]);
      
      setBills(billsRes.data);
      setCustomers(custRes.data);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterMonth, filterStatus]);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    setGenMsg('');
    try {
      const res = await axios.post('/bills', genForm);
      setGenMsg(`✅ Bill BL-${res.data.bill_id} generated — M ${parseFloat(res.data.amount_due).toFixed(2)} for ${res.data.account_number}`);
      setShowGenerate(false);
      setGenForm({
        accountNumber: '', month: '', year: new Date().getFullYear(),
        meterPrevious: '', meterCurrent: '', dueDate: ''
      });
      fetchData();
    } catch (err) {
      setGenMsg(`❌ ${err.response?.data?.error || 'Failed to generate bill.'}`);
    } finally {
      setGenLoading(false);
    }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Manage Bills</h2>
        <button className="btn-primary" onClick={() => { setShowGenerate(!showGenerate); setGenMsg(''); }}>
          {showGenerate ? 'Close Form' : '+ Generate Bill'}
        </button>
      </div>

      {genMsg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem',
          background: genMsg.startsWith('✅') ? '#e3fcef' : '#ffe3e3',
          color: genMsg.startsWith('✅') ? '#0f8a4f' : '#ff4242'
        }}>{genMsg}</div>
      )}

      {showGenerate && (
        <form onSubmit={handleGenerateBill} style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Generate New Bill</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Select Customer</label>
              <select 
                required 
                value={genForm.accountNumber}
                onChange={async (e) => {
                  const acc = e.target.value;
                  setGenForm({ ...genForm, accountNumber: acc });
                  if (acc) {
                    try {
                      const res = await axios.get(`/bills/latest-reading/${acc}`);
                      const now = new Date();
                      const currentMonth = now.toLocaleString('default', { month: 'short' });
                      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
                      
                      setGenForm(prev => ({ 
                        ...prev, 
                        accountNumber: acc,
                        meterPrevious: res.data.lastReading,
                        month: currentMonth,
                        year: now.getFullYear(),
                        dueDate: nextMonth.toISOString().split('T')[0]
                      }));
                    } catch (err) {
                      console.error("Failed to fetch latest reading", err);
                    }
                  }
                }}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.account_number} value={c.account_number}>
                    {c.full_name} ({c.account_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" required value={genForm.dueDate}
                onChange={e => setGenForm({ ...genForm, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Month</label>
              <select required value={genForm.month} onChange={e => setGenForm({ ...genForm, month: e.target.value })}>
                <option value="">Select month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" required value={genForm.year} min="2020" max="2030"
                onChange={e => setGenForm({ ...genForm, year: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Previous Meter Reading (m³)</label>
              <input type="number" required step="0.01" value={genForm.meterPrevious}
                onChange={e => setGenForm({ ...genForm, meterPrevious: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Current Meter Reading (m³)</label>
              <input type="number" required step="0.01" value={genForm.meterCurrent}
                onChange={e => setGenForm({ ...genForm, meterCurrent: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={genLoading}>
              {genLoading ? 'Generating...' : 'Generate & Save Bill'}
            </button>
            <button type="button" className="btn-outline" onClick={() => setShowGenerate(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <select style={{ padding: '0.75rem', width: '200px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select style={{ padding: '0.75rem', width: '200px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {error && <div style={{ color: '#ff4242', background: '#ffe3e3', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Bill ID</th>
              <th style={{ padding: '1rem' }}>Account No.</th>
              <th style={{ padding: '1rem' }}>Month</th>
              <th style={{ padding: '1rem' }}>Usage (m³)</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Due Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bills...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bills found.</td></tr>
            ) : bills.map(b => (
              <tr key={b.bill_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>BL-{b.bill_id}</td>
                <td style={{ padding: '1rem', color: 'var(--primary-blue)', fontWeight: 500 }}>{b.account_number}</td>
                <td style={{ padding: '1rem' }}>{b.month} {b.year}</td>
                <td style={{ padding: '1rem' }}>{parseFloat(b.usage_m3).toFixed(2)}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>M {parseFloat(b.amount_due).toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>{b.due_date?.substring(0, 10)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                    backgroundColor: b.status === 'Paid' ? '#e3fcef' : b.status === 'Overdue' ? '#fff4e3' : '#ffe3e3',
                    color: b.status === 'Paid' ? '#0f8a4f' : b.status === 'Overdue' ? '#d97706' : '#ff4242'
                  }}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBills;
