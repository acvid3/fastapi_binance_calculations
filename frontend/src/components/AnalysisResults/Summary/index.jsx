import React from 'react';
import styles from './style.module.css';

function Summary({ summary }) {
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

    return (
        <div className={styles.summarySection}>
            <h3>Results Summary</h3>
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <h4>Initial Balance</h4>
                    <p className={styles.summaryValue}>{formatCurrency(summary.initial_balance)}</p>
                </div>
                <div className={styles.summaryCard}>
                    <h4>Final Balance</h4>
                    <p className={styles.summaryValue}>{formatCurrency(summary.final_balance)}</p>
                </div>
                <div className={styles.summaryCard}>
                    <h4>Total Profit</h4>
                    <p className={`${styles.summaryValue} ${summary.total_profit >= 0 ? styles.positive : styles.negative}`}>
                        {formatCurrency(summary.total_profit)}
                    </p>
                </div>
                <div className={styles.summaryCard}>
                    <h4>ROI</h4>
                    <p className={`${styles.summaryValue} ${summary.roi_percent >= 0 ? styles.positive : styles.negative}`}>
                        {formatPercent(summary.roi_percent)}
                    </p>
                </div>
                <div className={styles.summaryCard}>
                    <h4>Total Trades</h4>
                    <p className={styles.summaryValue}>{summary.total_trades}</p>
                </div>
                <div className={styles.summaryCard}>
                    <h4>Min Balance</h4>
                    <p className={styles.summaryValue}>{formatCurrency(summary.min_balance)}</p>
                </div>
                <div className={styles.summaryCard}>
                    <h4>Open Positions</h4>
                    <p className={styles.summaryValue}>{summary.pending_positions}</p>
                </div>
            </div>
        </div>
    );
}

export default Summary;
