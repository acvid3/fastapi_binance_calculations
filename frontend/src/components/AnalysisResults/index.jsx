import React, { useState } from 'react';
import Summary from './Summary';
import TradesTable from './TradesTable';
import Charts from './Charts';
import styles from './style.module.css';

function AnalysisResults({ data }) {
    const [activeTab, setActiveTab] = useState('summary');

    const { summary, trades, chart_data } = data;

    return (
        <div className={styles.analysisResults}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    Summary
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'trades' ? styles.active : ''}`}
                    onClick={() => setActiveTab('trades')}
                >
                    Trades
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'charts' ? styles.active : ''}`}
                    onClick={() => setActiveTab('charts')}
                >
                    Charts
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'summary' && <Summary summary={summary} />}
                {activeTab === 'trades' && <TradesTable trades={trades} />}
                {activeTab === 'charts' && <Charts chart_data={chart_data} />}
            </div>
        </div>
    );
}

export default AnalysisResults;
