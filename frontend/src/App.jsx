import React, { useState } from 'react';
import InvestmentForm from './components/InvestmentForm';
import AnalysisResults from './components/AnalysisResults';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysis = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Investment Strategy Analysis</h1>
        <p>Analyze investment returns with commissions and trading steps</p>
        <div className="deployment-info">
          <span>Frontend: Vercel</span>
          <span>Backend: AWS</span>
        </div>
      </header>
      
      <main className="app-main">
        <InvestmentForm onSubmit={handleAnalysis} loading={loading} />
        
        {error && (
          <div className="error-message">
            <h3>Analysis Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {analysisData && (
          <AnalysisResults data={analysisData} />
        )}
      </main>
    </div>
  );
}

export default App;
