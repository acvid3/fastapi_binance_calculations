from datetime import datetime
from typing import List, Dict, Any
from fastapi import HTTPException

from ..models.investment_models import InvestmentParams, TradeRecord, AnalysisResult
from ..repositories.async_binance_repository import AsyncBinanceRepository


class AsyncInvestmentAnalysisService:
    
    def __init__(self):
        self.binance_repository = None
    
    async def analyze_investment_strategy(self, params: InvestmentParams) -> AnalysisResult:
        print(f"Starting analysis for {params.symbol} from {params.start_date} to {params.end_date}")
        print(f"Timestamps: {params.start_timestamp} to {params.end_timestamp}")
        
        async with AsyncBinanceRepository() as binance_repo:
            self.binance_repository = binance_repo
            
            history_list = await self.binance_repository.get_historical_price_data_parallel(
                start_time=params.start_timestamp,
                end_time=params.end_timestamp,
                symbol=params.symbol,
                interval=params.interval
            )
            
            print(f"Received {len(history_list)} price records")
            
            if not history_list:
                raise HTTPException(
                    status_code=400, 
                    detail="No data available for the specified period"
                )
            
            trades, summary, chart_data = await self._execute_strategy_analysis(params, history_list)
            
            return AnalysisResult(
                trades=trades,
                summary=summary,
                chart_data=chart_data
            )
    
    async def _execute_strategy_analysis(self, params: InvestmentParams, history_list: List[Dict[str, Any]]) -> tuple:
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
        
        print(f"Strategy initialized with:")
        print(f"  Initial balance: ${balance}")
        print(f"  Trade amount: ${params.trade_amount}")
        print(f"  Threshold: {params.threshold_percent * 100}%")
        print(f"  First price: ${current_price}")
        print(f"  First timestamp: {datetime.fromtimestamp(history_list[0]['timestamp'] / 1000)}")
        
        day_counter = 0
        current_day = None
        
        for i, row in enumerate(history_list):
            price = float(row["close"])
            timestamp = row["timestamp"]
            current_date = datetime.fromtimestamp(timestamp / 1000)
            
            if current_day != current_date.date():
                current_day = current_date.date()
                day_counter += 1
                if day_counter % 5 == 0:  # Log every 5 days
                    print(f"  Day {day_counter}: {current_date.strftime('%Y-%m-%d')} - Price: ${price:.2f}, Balance: ${balance:.2f}, ETH: {eth_balance:.6f}")

            if balance < min_balance:
                min_balance = balance

            if balance >= params.trade_amount:
                threshold_price = last_buy_price * (1 - params.threshold_percent)
                if price <= threshold_price:
                    print(f"  BUY SIGNAL at {current_date.strftime('%Y-%m-%d %H:%M')}:")
                    print(f"    Current price: ${price:.2f}")
                    print(f"    Threshold price: ${threshold_price:.2f}")
                    print(f"    Last buy price: ${last_buy_price:.2f}")
                    print(f"    Price drop: {((last_buy_price - price) / last_buy_price * 100):.2f}%")
                    
                    trade_record = self._execute_buy_order(
                        params, price, timestamp, order_counter, balance, eth_balance
                    )
                    trades.append(trade_record)
                    
                    sell_task = self._create_sell_task(
                        order_counter, price, params.threshold_percent, 
                        trade_record.eth_amount, params.trade_amount, timestamp
                    )
                    pending_sells.append(sell_task)
                    
                    commission = params.trade_amount * params.commission_rate
                    eth_amount = (params.trade_amount - commission) / price
                    balance -= params.trade_amount
                    eth_balance += eth_amount
                    last_buy_price = price
                    order_counter += 1
                    
                    print(f"    BUY executed: {eth_amount:.6f} ETH for ${params.trade_amount}")
                    print(f"    New balance: ${balance:.2f}, ETH: {eth_balance:.6f}")
                else:
                    if i % 1000 == 0:  # Log every 1000th check to avoid spam
                        print(f"    Price check at {current_date.strftime('%Y-%m-%d %H:%M')}: ${price:.2f} > ${threshold_price:.2f} (no buy)")

            if pending_sells:
                for task in list(pending_sells):
                    buy_price = task["buy_price"]
                    target_price = task["target_price"]

                    if price >= target_price:
                        print(f"  SELL SIGNAL at {current_date.strftime('%Y-%m-%d %H:%M')}:")
                        print(f"    Current price: ${price:.2f}")
                        print(f"    Target price: ${target_price:.2f}")
                        print(f"    Buy price was: ${buy_price:.2f}")
                        print(f"    Price rise: {((price - buy_price) / buy_price * 100):.2f}%")
                        
                        trade_record = self._execute_sell_order(
                            params, price, timestamp, order_counter, task, 
                            balance, eth_balance
                        )
                        trades.append(trade_record)
                        
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
                        order_counter += 1
                        pending_sells.remove(task)
                        
                        print(f"    SELL executed: {eth_to_sell:.6f} ETH for ${net_usdt:.2f}")
                        print(f"    Profit: ${profit:.2f}")
                        print(f"    New balance: ${balance:.2f}, ETH: {eth_balance:.6f}")

            if not pending_sells and price > last_buy_price:
                last_buy_price = price
        
        print(f"\nStrategy execution completed:")
        print(f"  Total trades: {len(trades)}")
        print(f"  Closed trades: {total_trades}")
        print(f"  Pending positions: {len(pending_sells)}")
        print(f"  Final balance: ${balance:.2f}")
        print(f"  Final ETH: {eth_balance:.6f}")
        
        summary = self._create_summary(params, balance, eth_balance, history_list, total_profit, total_trades, min_balance, pending_sells)
        chart_data = self._create_chart_data(trades)
        
        return trades, summary, chart_data
    
    def _execute_buy_order(self, params: InvestmentParams, price: float, timestamp: int, 
                          order_counter: int, balance: float, eth_balance: float) -> TradeRecord:
        commission = params.trade_amount * params.commission_rate
        eth_amount = (params.trade_amount - commission) / price
        
        return TradeRecord(
            order_id=f"BUY_{order_counter:04d}",
            order_type="BUY",
            date_time=datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d %H:%M:%S"),
            price=price,
            eth_amount=eth_amount,
            usdt_amount=params.trade_amount,
            commission=commission,
            balance_after=balance - params.trade_amount,
            eth_balance_after=eth_balance + eth_amount,
            level_price=price,
            related_order_id=None,
            status="OPEN",
            profit=None
        )
    
    def _create_sell_task(self, order_counter: int, buy_price: float, threshold_percent: float,
                         eth_amount: float, cost_usdt: float, timestamp: int) -> Dict[str, Any]:
        return {
            "task_id": f"TASK_{order_counter:04d}",
            "buy_id": f"BUY_{order_counter:04d}",                         
            "buy_price": buy_price,                        
            "target_price": buy_price * (1 + threshold_percent), 
            "eth_amount": eth_amount,                 
            "cost_usdt": cost_usdt,                 
            "buy_timestamp": timestamp
        }
    
    def _execute_sell_order(self, params: InvestmentParams, price: float, timestamp: int,
                           order_counter: int, task: Dict[str, Any], balance: float, 
                           eth_balance: float) -> TradeRecord:
        eth_to_sell = task["eth_amount"]
        gross_usdt = eth_to_sell * price
        commission = gross_usdt * params.commission_rate
        net_usdt = gross_usdt - commission
        
        invested = task["cost_usdt"]
        profit = net_usdt - invested
        
        return TradeRecord(
            order_id=f"SELL_{order_counter:04d}",
            order_type="SELL",
            date_time=datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d %H:%M:%S"),
            price=price,
            eth_amount=-eth_to_sell,
            usdt_amount=net_usdt,
            commission=commission,
            balance_after=balance + net_usdt,
            eth_balance_after=eth_balance - eth_to_sell,
            level_price=task["buy_price"],
            related_order_id=task["buy_id"],
            status="CLOSED",
            profit=profit
        )
    
    def _create_summary(self, params: InvestmentParams, balance: float, eth_balance: float,
                       history_list: List[Dict[str, Any]], total_profit: float, 
                       total_trades: int, min_balance: float, pending_sells: List[Dict[str, Any]]) -> Dict[str, Any]:
        final_balance = balance + (eth_balance * float(history_list[-1]["close"]))
        
        return {
            "initial_balance": params.initial_balance,
            "final_balance": final_balance,
            "total_profit": total_profit,
            "total_trades": total_trades,
            "min_balance": min_balance,
            "roi_percent": (final_balance - params.initial_balance) / params.initial_balance * 100,
            "pending_positions": len(pending_sells)
        }
    
    def _create_chart_data(self, trades: List[TradeRecord]) -> Dict[str, Any]:
        return {
            "dates": [trade.date_time for trade in trades],
            "prices": [trade.price for trade in trades],
            "balances": [trade.balance_after for trade in trades],
            "profits": [trade.profit if trade.profit else 0 for trade in trades]
        }
