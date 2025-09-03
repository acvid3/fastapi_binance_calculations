import React from 'react';
import styles from './style.module.css';
import MarketIndicator from '../../MarketIndicator';
import { formatCurrency, getMarketData } from '../../../utils/tradeUtils';

function MobileTradeCard({ trade, index, trades }) {
    const marketData = getMarketData(trade, index, trades);

    return (
        <div className={`${styles.tradeCard} ${trade.order_type === 'BUY' ? styles.buyCard : styles.sellCard}`}>
            <div className={styles.cardHeader}>
                <div className={styles.tradeId}>
                    <span className={styles.idLabel}>ID:</span>
                    <span className={styles.idValue}>{trade.order_id}</span>
                </div>
                <div className={`${styles.tradeType} ${styles[trade.order_type.toLowerCase()]}`}>
                    {trade.order_type}
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Date/Time:</span>
                    <span className={styles.value}>{trade.date_time}</span>
                </div>

                <div className={styles.infoRow}>
                    <span className={styles.label}>ETH Amount:</span>
                    <span className={styles.value}>{trade.eth_amount.toFixed(6)}</span>
                </div>

                <div className={styles.infoRow}>
                    <span className={styles.label}>USDT Amount:</span>
                    <span className={styles.value}>{formatCurrency(trade.usdt_amount)}</span>
                </div>

                <div className={styles.infoRow}>
                    <span className={styles.label}>Commission:</span>
                    <span className={styles.value}>{formatCurrency(trade.commission)}</span>
                </div>

                <div className={styles.infoRow}>
                    <span className={styles.label}>Balance After:</span>
                    <span className={styles.value}>{formatCurrency(trade.balance_after)}</span>
                </div>

                {trade.profit && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Profit:</span>
                        <span className={`${styles.value} ${trade.profit >= 0 ? styles.positive : styles.negative}`}>
                            {formatCurrency(trade.profit)}
                        </span>
                    </div>
                )}

                <div className={styles.infoRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.status} ${styles[trade.status.toLowerCase()]}`}>
                        {trade.status}
                    </span>
                </div>
            </div>

            <div className={styles.marketIndicatorContainer}>
                <MarketIndicator
                    price={trade.price}
                    previousPrice={marketData.previousPrice}
                    volume={trade.usdt_amount}
                    volumeChange={marketData.volumeChange}
                    compact={false}
                />
            </div>
        </div>
    );
}

function MobileTradesList({ trades }) {
    return (
        <div>
            {trades.map((trade, index) => (
                <MobileTradeCard
                    key={index}
                    trade={trade}
                    index={index}
                    trades={trades}
                />
            ))}
        </div>
    );
}

export default MobileTradesList;
