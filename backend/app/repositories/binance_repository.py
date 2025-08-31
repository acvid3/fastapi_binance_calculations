import requests
from time import sleep
from typing import List, Dict, Any


class BinanceRepository:
    
    def __init__(self, session: requests.Session):
        self.session = session
        self.base_url = "https://api.binance.com/api/v3"
    
    def get_price_data(self, start_time: int, limit: int, symbol: str, interval: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/klines?symbol={symbol}&interval={interval}&startTime={start_time}&limit={limit}"
        
        try:
            response = self.session.get(url)
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
    
    def get_historical_price_data(self, start_time: int, end_time: int, limit: int, symbol: str, interval: str) -> List[Dict[str, Any]]:
        history_list = []
        current_start = start_time
        
        while current_start < end_time:
            data = self.get_price_data(current_start, limit, symbol, interval)
            if not data:
                break

            sleep(0.1)
            max_unixtime = max(item["timestamp"] for item in data)
            current_start = max_unixtime + 1
            history_list.extend(data)
        
        return history_list
    
    def get_available_symbols(self) -> List[str]:
        try:
            response = self.session.get(f"{self.base_url}/exchangeInfo")
            response.raise_for_status()
            data = response.json()
            symbols = [symbol["symbol"] for symbol in data["symbols"] if symbol["status"] == "TRADING" and symbol["symbol"].endswith("USDT")]
            return symbols
        except Exception as e:
            return []
