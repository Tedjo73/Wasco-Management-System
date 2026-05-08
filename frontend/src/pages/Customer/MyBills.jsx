import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterYear) params.year = filterYear;
        const res = await axios.get('/bills/my', { params });
        setBills(res.data.bills || []);
        setPage(1);
      } catch {
        setError('Could not load bills.');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [filterStatus, filterYear]);

  const totalPages = Math.ceil(bills.length / PER_PAGE);
  const paginated = bills.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="animate-fade-in card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>My Bills</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select style={{ width: 'auto', padding: '0.5rem 1rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select style={{ width: 'auto', padding: '0.5rem 1rem' }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ color: '#ff4242', background: '#ffe3e3', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading bills...</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Bill ID</th>
                  <th style={{ padding: '1rem' }}>Billing Month</th>
                  <th style={{ padding: '1rem' }}>Meter (Prev → Curr)</th>
                  <th style={{ padding: '1rem' }}>Usage (m³)</th>
                  <th style={{ padding: '1rem' }}>Amount Due</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bills found.</td></tr>
                ) : paginated.map(bill => (
                  <tr key={bill.bill_id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>BL-{bill.bill_id}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{bill.month} {bill.year}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {parseFloat(bill.meter_reading_previous).toFixed(0)} → {parseFloat(bill.meter_reading_current).toFixed(0)}
                    </td>
                    <td style={{ padding: '1rem' }}>{parseFloat(bill.usage_m3).toFixed(2)}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>M {parseFloat(bill.amount_due).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                        backgroundColor: bill.status === 'Paid' ? '#e3fcef' : bill.status === 'Overdue' ? '#fff4e3' : '#ffe3e3',
                        color: bill.status === 'Paid' ? '#0f8a4f' : bill.status === 'Overdue' ? '#d97706' : '#ff4242'
                      }}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {bill.status !== 'Paid' ? (
                        <Link to="/customer/pay" state={{ bill }} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Pay</Link>
                      ) : (
                        <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Receipt</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBills;
