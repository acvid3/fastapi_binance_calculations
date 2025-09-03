import React from 'react';
import styles from './style.module.css';

const MarketIndicator = ({ price, previousPrice, volume, volumeChange, compact = false }) => {
    const priceChange = price - previousPrice;
    const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
    
    const isBullish = priceChangePercent > 0;
    const isBearish = priceChangePercent < 0;
    
    const volumeRatio = volumeChange > 0 ? Math.min(volumeChange / 100, 1) : 0;
    const bearishVolumeRatio = volumeChange < 0 ? Math.min(Math.abs(volumeChange) / 100, 1) : 0;
    
    const getVolumeStatus = () => {
        if (volumeChange > 20) return 'BULL';
        if (volumeChange < -20) return 'BEAR';
        return 'NEUTRAL';
    };
    
    const volumeStatus = getVolumeStatus();
    
    return (
        <div className={`${styles.indicator} ${compact ? styles.compact : ''}`}>
            <div className={styles.priceInfo}>
                <span className={styles.price}>${price.toFixed(2)}</span>
                <span className={`${styles.change} ${isBullish ? styles.positive : styles.negative}`}>
                    {isBullish ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </span>
            </div>
            
            <div className={styles.volumeIndicator}>
                <div className={styles.volumeLabel}>
                    <span className={styles.volumeText}>Volume</span>
                    <span className={`${styles.volumeStatus} ${
                        volumeStatus === 'BULL' ? styles.bull : 
                        volumeStatus === 'BEAR' ? styles.bear : styles.neutral
                    }`}>
                        {volumeStatus}
                    </span>
                </div>
                
                <div className={styles.progressBars}>
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div 
                                className={`${styles.progressFill} ${styles.bullProgress}`}
                                style={{ width: `${volumeRatio * 100}%` }}
                            ></div>
                        </div>
                        <span className={styles.progressLabel}>BULL</span>
                    </div>
                    
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div 
                                className={`${styles.progressFill} ${styles.bearProgress}`}
                                style={{ width: `${bearishVolumeRatio * 100}%` }}
                            ></div>
                        </div>
                        <span className={styles.progressLabel}>BEAR</span>
                    </div>
                </div>
                
                <div className={styles.volumeDetails}>
                    <span className={styles.volumeValue}>
                        {volume.toLocaleString()}
                    </span>
                    <span className={`${styles.volumeChange} ${
                        volumeChange > 0 ? styles.positive : styles.negative
                    }`}>
                        {volumeChange > 0 ? '+' : ''}{volumeChange.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MarketIndicator;
