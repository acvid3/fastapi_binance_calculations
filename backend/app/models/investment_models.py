from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class InvestmentParams(BaseModel):
    initial_balance: float = 10000
    trade_amount: float = 1000
    threshold_percent: float = 0.05
    commission_rate: float = 0.00075
    start_date: str
    end_date: str
    symbol: str = "ETHUSDT"
    interval: str = "1h"
    
    start_timestamp: Optional[int] = None
    end_timestamp: Optional[int] = None
    
    def set_timestamps(self, start_timestamp: int, end_timestamp: int):
        self.start_timestamp = start_timestamp
        self.end_timestamp = end_timestamp


class TradeRecord(BaseModel):
    order_id: str
    order_type: str
    date_time: str
    price: float
    eth_amount: float
    usdt_amount: float
    commission: float
    balance_after: float
    eth_balance_after: float
    level_price: float
    related_order_id: Optional[str]
    status: str
    profit: Optional[float]


class AnalysisResult(BaseModel):
    trades: List[TradeRecord]
    summary: dict
    chart_data: dict
