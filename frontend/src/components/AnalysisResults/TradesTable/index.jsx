import React from 'react';
import styles from './style.module.css';
import MarketIndicator from '../../MarketIndicator';

function TradesTable({ trades }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const getMarketData = (trade, index) => {
        if (index === 0) {
            return {
                previousPrice: trade.price,
                volumeChange: 0
            };
        }
        
        const previousTrade = trades[index - 1];
        const priceChange = trade.price - previousTrade.price;
        const volumeChange = ((trade.usdt_amount - previousTrade.usdt_amount) / previousTrade.usdt_amount) * 100;
        
        return {
            previousPrice: previousTrade.price,
            volumeChange: volumeChange
        };
    };

    return (
        <div className={styles.tradesSection}>
            <h3>Trade History</h3>
            <div className={styles.tableContainer}>
                <table className={styles.tradesTable}>
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
                            <th>Market Indicator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade, index) => {
                            const marketData = getMarketData(trade, index);
                            
                            return (
                                <tr key={index} className={trade.order_type === 'BUY' ? styles.buyRow : styles.sellRow}>
                                    <td>{trade.order_id}</td>
                                    <td>
                                        <span className={`${styles.tradeType} ${styles[trade.order_type.toLowerCase()]}`}>
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
                                            <span className={trade.profit >= 0 ? styles.positive : styles.negative}>
                                                {formatCurrency(trade.profit)}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${styles[trade.status.toLowerCase()]}`}>
                                            {trade.status}
                                        </span>
                                    </td>
                                    <td className={styles.indicatorCell}>
                                        <MarketIndicator
                                            price={trade.price}
                                            previousPrice={marketData.previousPrice}
                                            volume={trade.usdt_amount}
                                            volumeChange={marketData.volumeChange}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TradesTable;
