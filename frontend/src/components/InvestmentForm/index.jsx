import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { apiUrl } from '../../apiBase';
import styles from './style.module.css';

function InvestmentForm({ onSubmit, loading, selectedSymbol }) {
    const [formData, setFormData] = useState({
        initial_balance: 10000,
        trade_amount: 1000,
        threshold_percent: 5,
        commission_rate: 0.075,
        start_date: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'),
        end_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
        symbol: 'ETHUSDT',
        interval: '1h'
    });

    const [symbols, setSymbols] = useState([]);
    const [loadingSymbols, setLoadingSymbols] = useState(false);

    useEffect(() => {
        fetchSymbols();
    }, []);

    useEffect(() => {
        if (selectedSymbol) {
            setFormData(prev => ({
                ...prev,
                symbol: selectedSymbol
            }));
        }
    }, [selectedSymbol]);

    const fetchSymbols = async () => {
        setLoadingSymbols(true);
        try {
            const response = await fetch(apiUrl('symbols'));
            if (response.ok) {
                const data = await response.json();
                setSymbols(data.symbols);
            }
        } catch (error) {
            console.error('Error fetching symbols:', error);
        } finally {
            setLoadingSymbols(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('percent') || name.includes('rate') ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitData = {
            ...formData,
            threshold_percent: formData.threshold_percent / 100,
            commission_rate: formData.commission_rate / 100
        };
        
        onSubmit(submitData);
    };

    return (
        <div className={styles.investmentForm}>
            <h2>Analysis Parameters</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="initial_balance">Initial Balance (USDT)</label>
                        <input
                            type="number"
                            id="initial_balance"
                            name="initial_balance"
                            value={formData.initial_balance}
                            onChange={handleInputChange}
                            min="100"
                            step="100"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="trade_amount">Trade Amount (USDT)</label>
                        <input
                            type="number"
                            id="trade_amount"
                            name="trade_amount"
                            value={formData.trade_amount}
                            onChange={handleInputChange}
                            min="10"
                            step="10"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="threshold_percent">Price Change Threshold (%)</label>
                        <input
                            type="number"
                            id="threshold_percent"
                            name="threshold_percent"
                            value={formData.threshold_percent}
                            onChange={handleInputChange}
                            min="0.1"
                            max="50"
                            step="0.1"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="commission_rate">Commission Rate (%)</label>
                        <input
                            type="number"
                            id="commission_rate"
                            name="commission_rate"
                            value={formData.commission_rate}
                            onChange={handleInputChange}
                            min="0.001"
                            max="10"
                            step="0.001"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="start_date">Start Date & Time</label>
                        <input
                            type="datetime-local"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="end_date">End Date & Time</label>
                        <input
                            type="datetime-local"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="symbol">Trading Pair</label>
                        <div className={styles.symbolDisplay}>
                            <span className={styles.selectedSymbol}>{formData.symbol}</span>
                            <span className={styles.symbolNote}>
                                (Selected from sidebar)
                            </span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="interval">Time Interval</label>
                        <select
                            id="interval"
                            name="interval"
                            value={formData.interval}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="1m">1 minute</option>
                            <option value="5m">5 minutes</option>
                            <option value="15m">15 minutes</option>
                            <option value="1h">1 hour</option>
                            <option value="4h">4 hours</option>
                            <option value="1d">1 day</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Investment Strategy'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default InvestmentForm;
