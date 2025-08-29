import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function AnalysisResults({ data }) {
  const [activeTab, setActiveTab] = useState('summary');

  const { summary, trades, chart_data } = data;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const renderSummary = () => (
    <div className="summary-section">
      <h3>Results Summary</h3>
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Initial Balance</h4>
          <p className="summary-value">{formatCurrency(summary.initial_balance)}</p>
        </div>
        <div className="summary-card">
          <h4>Final Balance</h4>
          <p className="summary-value">{formatCurrency(summary.final_balance)}</p>
        </div>
        <div className="summary-card">
          <h4>Total Profit</h4>
          <p className={`summary-value ${summary.total_profit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary.total_profit)}
          </p>
        </div>
        <div className="summary-card">
          <h4>ROI</h4>
          <p className={`summary-value ${summary.roi_percent >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(summary.roi_percent)}
          </p>
        </div>
        <div className="summary-card">
          <h4>Total Trades</h4>
          <p className="summary-value">{summary.total_trades}</p>
        </div>
        <div className="summary-card">
          <h4>Min Balance</h4>
          <p className="summary-value">{formatCurrency(summary.min_balance)}</p>
        </div>
        <div className="summary-card">
          <h4>Open Positions</h4>
          <p className="summary-value">{summary.pending_positions}</p>
        </div>
      </div>
    </div>
  );

  const renderTradesTable = () => (
    <div className="trades-section">
      <h3>Trade History</h3>
      <div className="table-container">
        <table className="trades-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Date/Time</th>
              <th>Price</th>
              <th>ETH Amount</th>
              <th>USDT Amount</th>
              <th>Commission</th>
              <th>Balance After</th>
              <th>Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={index} className={trade.order_type === 'BUY' ? 'buy-row' : 'sell-row'}>
                <td>{trade.order_id}</td>
                <td>
                  <span className={`trade-type ${trade.order_type.toLowerCase()}`}>
                    {trade.order_type}
                  </span>
                </td>
                <td>{trade.date_time}</td>
                <td>{formatCurrency(trade.price)}</td>
                <td>{trade.eth_amount.toFixed(6)}</td>
                <td>{formatCurrency(trade.usdt_amount)}</td>
                <td>{formatCurrency(trade.commission)}</td>
                <td>{formatCurrency(trade.balance_after)}</td>
                <td>
                  {trade.profit ? (
                    <span className={trade.profit >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(trade.profit)}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <span className={`status ${trade.status.toLowerCase()}`}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="charts-section">
      <h3>Charts</h3>
      
      <div className="chart-container">
        <h4>Price and Balance Dynamics</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chart_data.dates.map((date, index) => ({
            date: date.split(' ')[0],
            price: chart_data.prices[index],
            balance: chart_data.balances[index]
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
            <Line yAxisId="right" type="monotone" dataKey="balance" stroke="#82ca9d" name="Balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h4>Profit by Trades</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chart_data.dates.map((date, index) => ({
            date: date.split(' ')[0],
            profit: chart_data.profits[index]
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="analysis-results">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('trades')}
        >
          Trades
        </button>
        <button
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'trades' && renderTradesTable()}
        {activeTab === 'charts' && renderCharts()}
      </div>
    </div>
  );
}

export default AnalysisResults;
