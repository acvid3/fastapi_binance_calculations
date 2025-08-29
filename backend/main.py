from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import requests
import csv
from datetime import datetime, timedelta
from time import sleep
import os

app = FastAPI(title="Investment Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://13.50.4.32:8000",
        "http://13.50.4.32",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvestmentParams(BaseModel):
    initial_balance: float = 10000
    trade_amount: float = 1000
    threshold_percent: float = 0.05
    commission_rate: float = 0.00075
    start_date: str
    end_date: str
    symbol: str = "ETHUSDT"
    interval: str = "1h"

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

def convert_date_to_timestamp(date_str: str) -> int:
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return int(dt.timestamp() * 1000)
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")

def get_price(start_time: int, limit: int, symbol: str, interval: str):
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&startTime={start_time}&limit={limit}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        response_data = response.json()
        
        data = []
        for kline in response_data:
            price_data = {
                "timestamp": kline[0],           
                "open": float(kline[1]),         
                "high": float(kline[2]),         
                "low": float(kline[3]),          
                "close": float(kline[4]),        
                "volume": float(kline[5]),       
                "close_time": kline[6]           
            }
            data.append(price_data)
        
        return data
    except Exception as e:
        return []

def get_historical_price(start_time: int, end_time: int, limit: int, symbol: str, interval: str):
    history_list = []
    current_start = start_time
    
    while current_start < end_time:
        data = get_price(current_start, limit, symbol, interval)
        if not data:
            break

        sleep(0.1)
        max_unixtime = max(item["timestamp"] for item in data)
        current_start = max_unixtime + 1
        history_list.extend(data)
    
    return history_list

def analyze_investment_strategy(params: InvestmentParams) -> AnalysisResult:
    start_timestamp = convert_date_to_timestamp(params.start_date)
    end_timestamp = convert_date_to_timestamp(params.end_date)
    
    history_list = get_historical_price(start_timestamp, end_timestamp, 1000, params.symbol, params.interval)
    
    if not history_list:
        raise HTTPException(status_code=400, detail="No data available for the specified period")
    
    balance = params.initial_balance
    eth_balance = 0
    pending_sells = []
    order_counter = 1
    trades = []
    last_buy_price = None
    
    current_price = float(history_list[0]["close"])
    last_buy_price = current_price
    min_balance = balance
    total_profit = 0
    total_trades = 0
    
    for row in history_list:
        price = float(row["close"])
        timestamp = row["timestamp"]

        if balance < min_balance:
            min_balance = balance

        if balance >= params.trade_amount:
            if price <= last_buy_price * (1 - params.threshold_percent):
                commission = params.trade_amount * params.commission_rate
                eth_amount = (params.trade_amount - commission) / price
                
                balance -= params.trade_amount
                eth_balance += eth_amount
                last_buy_price = price
               
                sell_task = {
                    "task_id": f"TASK_{order_counter:04d}",
                    "buy_id": f"BUY_{order_counter:04d}",                         
                    "buy_price": price,                        
                    "target_price": price * (1 + params.threshold_percent), 
                    "eth_amount": eth_amount,                 
                    "cost_usdt": params.trade_amount,                 
                    "buy_timestamp": timestamp
                }
                pending_sells.append(sell_task)
                
                trade_record = TradeRecord(
                    order_id=f"BUY_{order_counter:04d}",
                    order_type="BUY",
                    date_time=datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d %H:%M:%S"),
                    price=price,
                    eth_amount=eth_amount,
                    usdt_amount=params.trade_amount,
                    commission=commission,
                    balance_after=balance,
                    eth_balance_after=eth_balance,
                    level_price=price,
                    related_order_id=None,
                    status="OPEN",
                    profit=None
                )
                trades.append(trade_record)
                order_counter += 1

        if pending_sells:
            for task in list(pending_sells):
                buy_price = task["buy_price"]
                target_price = task["target_price"]

                if price >= target_price:
                    eth_to_sell = task["eth_amount"]
                    gross_usdt = eth_to_sell * price
                    commission = gross_usdt * params.commission_rate
                    net_usdt = gross_usdt - commission

                    invested = task["cost_usdt"]
                    profit = net_usdt - invested
                    total_profit += profit
                    total_trades += 1

                    balance += net_usdt
                    eth_balance -= eth_to_sell
                    last_buy_price = price

                    trade_record = TradeRecord(
                        order_id=f"SELL_{order_counter:04d}",
                        order_type="SELL",
                        date_time=datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d %H:%M:%S"),
                        price=price,
                        eth_amount=-eth_to_sell,
                        usdt_amount=net_usdt,
                        commission=commission,
                        balance_after=balance,
                        eth_balance_after=eth_balance,
                        level_price=buy_price,
                        related_order_id=task["buy_id"],
                        status="CLOSED",
                        profit=profit
                    )
                    trades.append(trade_record)
                    order_counter += 1
                    pending_sells.remove(task)

        if not pending_sells and price > last_buy_price:
            last_buy_price = price

    chart_data = {
        "dates": [trade.date_time for trade in trades],
        "prices": [trade.price for trade in trades],
        "balances": [trade.balance_after for trade in trades],
        "profits": [trade.profit if trade.profit else 0 for trade in trades]
    }
    
    summary = {
        "initial_balance": params.initial_balance,
        "final_balance": balance + (eth_balance * float(history_list[-1]["close"])),
        "total_profit": total_profit,
        "total_trades": total_trades,
        "min_balance": min_balance,
        "roi_percent": ((balance + (eth_balance * float(history_list[-1]["close"]))) - params.initial_balance) / params.initial_balance * 100,
        "pending_positions": len(pending_sells)
    }
    
    return AnalysisResult(trades=trades, summary=summary, chart_data=chart_data)

@app.get("/")
async def root():
    return {"message": "Investment Analysis API", "version": "1.0.0", "deployment": "AWS"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_investments(params: InvestmentParams):
    try:
        result = analyze_investment_strategy(params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/symbols")
async def get_available_symbols():
    try:
        response = requests.get("https://api.binance.com/api/v3/exchangeInfo")
        response.raise_for_status()
        data = response.json()
        symbols = [symbol["symbol"] for symbol in data["symbols"] if symbol["status"] == "TRADING"]
        return {"symbols": symbols[:50]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
