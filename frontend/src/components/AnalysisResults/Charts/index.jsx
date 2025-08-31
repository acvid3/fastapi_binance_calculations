import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import styles from './style.module.css';

function Charts({ chart_data }) {
    return (
        <div className={styles.chartsSection}>
            <h3>Charts</h3>
            
            <div className={styles.chartContainer}>
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

            <div className={styles.chartContainer}>
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
}

export default Charts;
