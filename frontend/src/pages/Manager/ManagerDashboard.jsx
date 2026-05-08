import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

const ManagerDashboard = () => {
  const [period, setPeriod] = useState('Monthly');
  const [insights, setInsights] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [generalStats, setGeneralStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const [insightsRes, custStats, billStats] = await Promise.all([
          axios.get('/bills/insights', { params: { period } }),
          axios.get('/customers/stats'),
          axios.get('/bills/stats'),
        ]);
        setInsights(insightsRes.data);
        setCustomerStats(custStats.data);
        setGeneralStats(billStats.data);
      } catch (err) {
        console.error('Manager fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [period]);

  const chartData = (insights?.history || []).map(item => {
    let name = '';
    if (period === 'Daily') name = item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
    else if (period === 'Weekly') name = `Week ${item.week_start?.substring(5)}`;
    else if (period === 'Quarterly') name = `${item.quarter} ${item.year}`;
    else if (period === 'Yearly') name = item.year;
    else name = `${item.month} ${item.year}`;

    return {
      name,
      consumption: parseFloat(item.total_usage_m3 || 0),
      revenue: parseFloat(item.revenue || item.projected_revenue || 0),
      bills: parseInt(item.bills_generated || item.total_bills || 0)
  }).reverse();

  const revenueData = [
    { name: 'Collected', value: parseFloat(generalStats?.totalRevenue || 0), color: '#2bce89' },
    { name: 'Outstanding', value: parseFloat(generalStats?.outstandingBalance || 0), color: '#ff6b6b' },
  ];

  const fmt = (n) => n != null ? parseFloat(n).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';
  const fmtMoney = (n) => n != null ? parseFloat(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Strategic Insights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive performance metrics across districts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,119,182,0.05)', padding: '0.4rem', borderRadius: '10px' }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={period === p ? 'btn-primary' : 'btn-outline'}
              style={{ 
                padding: '0.4rem 1.2rem', 
                fontSize: '0.8rem', 
                border: period === p ? 'none' : '1px solid transparent',
                background: period === p ? 'var(--primary-blue)' : 'transparent'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Total Customer Base</p>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-blue)', margin: 0 }}>
            {loading ? '...' : fmt(customerStats?.totalCustomers)}
          </h3>
          <small style={{ color: '#2bce89' }}>Active Service Points</small>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Annual Usage Target</p>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--dark-navy)', margin: 0 }}>
            {loading ? '...' : `${fmt(insights?.summary?.totalUsageYear)} m³`}
          </h3>
          <small style={{ color: 'var(--text-muted)' }}>Projected Yearly Total</small>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Total Revenue (Life)</p>
          <h3 style={{ fontSize: '1.8rem', color: '#2bce89', margin: 0 }}>
            {loading ? '...' : `M ${fmt(generalStats?.totalRevenue)}`}
          </h3>
          <small style={{ color: '#2bce89' }}>Confirmed Payments</small>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Uncollected Funds</p>
          <h3 style={{ fontSize: '1.8rem', color: '#ff6b6b', margin: 0 }}>
            {loading ? '...' : `M ${fmt(generalStats?.outstandingBalance)}`}
          </h3>
          <small style={{ color: '#ff6b6b' }}>Risk Exposure</small>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Consumption Trends</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Water volume in cubic meters (m³)</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                {period === 'Daily' ? 'Real-time' : 'Historical'}
              </span>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="consumption" stroke="var(--primary-blue)" strokeWidth={4} dot={{ r: 4, fill: 'var(--primary-blue)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {loading ? 'Analyzing data...' : 'No billing records found for this period.'}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Revenue Collection</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Paid vs Outstanding Balances</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2bce89', background: 'rgba(43,206,137,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                HEALTHY
              </span>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            {(generalStats?.totalRevenue + generalStats?.outstandingBalance) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `M ${parseFloat(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {loading ? 'Processing financials...' : 'No payment data available.'}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Detailed Analysis — {period}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Summative data used for strategic reporting</p>
            </div>
            <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => window.print()}>
              Export PDF Report
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--bg-color)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Period</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Bills Generated</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Usage (m³)</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Projected Revenue (M)</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Avg. per Bill</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--bg-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{row.name}</td>
                    <td style={{ padding: '1rem' }}>{row.bills}</td>
                    <td style={{ padding: '1rem' }}>{fmt(row.consumption)}</td>
                    <td style={{ padding: '1rem', color: '#2bce89', fontWeight: '600' }}>M {fmtMoney(row.revenue)}</td>
                    <td style={{ padding: '1rem' }}>{row.bills > 0 ? (row.consumption / row.bills).toFixed(2) : '0.00'} m³</td>
                  </tr>
                ))}
                {chartData.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No analytical data for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
