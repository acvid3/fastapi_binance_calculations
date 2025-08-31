import React, { useState } from 'react';
import InvestmentForm from './components/InvestmentForm';
import AnalysisResults from './components/AnalysisResults';
import CurrencySelector from './components/CurrencySelector';
import { apiUrl } from './apiBase';
import './index.css';

function App() {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSymbol, setSelectedSymbol] = useState('ETHUSDT');

    const handleAnalysis = async (formData) => {
        setLoading(true);
        setError(null);
        
        try {
            const url = apiUrl('analyze');
            console.log('Sending analysis request to:', url);
                
            const response = await fetch(url, {
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

    const handleSymbolChange = (symbol) => {
        setSelectedSymbol(symbol);
    };

    return (
        <div className="app">
            <CurrencySelector 
                onSymbolChange={handleSymbolChange}
                selectedSymbol={selectedSymbol}
            />
            
            <div className="app-content">
                <header className="app-header">
                    <h1>Investment Strategy Analysis</h1>
                    <p>Analyze investment returns with commissions and trading steps</p>
                    <div className="deployment-info">
                        <span>Frontend: Vercel</span>
                        <span>Backend: AWS</span>
                    </div>
                </header>
                
                <main className="app-main">
                    <InvestmentForm 
                        onSubmit={handleAnalysis} 
                        loading={loading}
                        selectedSymbol={selectedSymbol}
                    />
                    
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
        </div>
    );
}

export default App;
