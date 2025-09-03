export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const getMarketData = (trade, index, trades) => {
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
