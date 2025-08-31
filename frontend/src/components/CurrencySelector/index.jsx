import React, { useState, useEffect } from 'react';
import styles from './style.module.css';

const CurrencySelector = ({ onSymbolChange, selectedSymbol }) => {
    const [symbols, setSymbols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSymbols();
    }, []);

    const fetchSymbols = async () => {
        try {
            const url = import.meta.env.DEV 
                ? 'http://13.50.4.32:8000/api/symbols'
                : '/api/symbols';
                
            const response = await fetch(url);
            const data = await response.json();
            setSymbols(data.symbols || []);
            
            if (data.symbols && data.symbols.length > 0 && !selectedSymbol) {
                onSymbolChange(data.symbols[0].symbol);
            }
        } catch (error) {
            console.error('Error fetching symbols:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSymbols = symbols.filter(symbol => 
        symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSymbolSelect = (symbol) => {
        onSymbolChange(symbol);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(price);
    };

    const formatVolume = (volume) => {
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(2)}M`;
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(2)}K`;
        }
        return volume.toFixed(2);
    };

    if (loading) {
        return (
            <div className={styles.sidebar}>
                <div className={styles.header}>
                    <h3>Currency Pairs</h3>
                </div>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <h3>Currency Pairs</h3>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.symbolsList}>
                {filteredSymbols.map((symbol) => (
                    <div
                        key={symbol.symbol}
                        className={`${styles.symbolItem} ${
                            selectedSymbol === symbol.symbol ? styles.selected : ''
                        }`}
                        onClick={() => handleSymbolSelect(symbol.symbol)}
                    >
                        <div className={styles.symbolHeader}>
                            <span className={styles.symbolText}>{symbol.symbol}</span>
                            {selectedSymbol === symbol.symbol && (
                                <span className={styles.checkmark}>✓</span>
                            )}
                        </div>
                        
                        <div className={styles.symbolDetails}>
                            <div className={styles.priceInfo}>
                                <span className={styles.currentPrice}>
                                    ${formatPrice(symbol.price)}
                                </span>
                                <span className={`${styles.priceChange} ${
                                    symbol.priceChangePercent >= 0 ? styles.positive : styles.negative
                                }`}>
                                    {symbol.priceChangePercent >= 0 ? '+' : ''}{symbol.priceChangePercent.toFixed(2)}%
                                </span>
                            </div>
                            
                            <div className={styles.volumeInfo}>
                                <span className={styles.volumeLabel}>Vol:</span>
                                <span className={styles.volumeValue}>
                                    {formatVolume(symbol.volume)}
                                </span>
                            </div>
                            
                            <div className={styles.rangeInfo}>
                                <span className={styles.rangeLabel}>24h:</span>
                                <span className={styles.volumeValue}>
                                    ${formatPrice(symbol.low24h)} - ${formatPrice(symbol.high24h)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurrencySelector;
