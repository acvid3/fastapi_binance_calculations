import aiohttp
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta


class AsyncBinanceRepository:
    
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3"
        self.session = None
        self.semaphore = asyncio.Semaphore(10)
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_price_data_chunk(self, start_time: int, limit: int, symbol: str, interval: str) -> List[Dict[str, Any]]:
        async with self.semaphore:
            url = f"{self.base_url}/klines?symbol={symbol}&interval={interval}&startTime={start_time}&limit={limit}"
            
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        response_data = await response.json()
                        
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
                    else:
                        return []
            except Exception as e:
                return []
    
    async def get_historical_price_data_parallel(self, start_time: int, end_time: int, symbol: str, interval: str) -> List[Dict[str, Any]]:
        chunk_size = 1000
        interval_ms = self._get_interval_ms(interval)
        
        total_duration = end_time - start_time
        total_candles = total_duration // interval_ms
        
        if total_candles <= chunk_size:
            return await self.get_price_data_chunk(start_time, chunk_size, symbol, interval)
        
        chunks = []
        current_start = start_time
        
        while current_start < end_time:
            chunk_end = min(current_start + (chunk_size * interval_ms), end_time)
            chunks.append((current_start, chunk_end))
            current_start = chunk_end
        
        print(f"Fetching {len(chunks)} chunks for {symbol} from {start_time} to {end_time}")
        print(f"Total duration: {total_duration}ms, interval: {interval_ms}ms, total candles: {total_candles}")
        
        tasks = []
        for chunk_start, chunk_end in chunks:
            task = self.get_price_data_chunk(chunk_start, chunk_size, symbol, interval)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_data = []
        for i, result in enumerate(results):
            if isinstance(result, list):
                all_data.extend(result)
                print(f"Chunk {i+1}: got {len(result)} candles")
            else:
                print(f"Chunk {i+1}: error - {result}")
        
        print(f"Total data collected: {len(all_data)} candles")
        return sorted(all_data, key=lambda x: x["timestamp"])
    
    async def get_symbol_24h_data(self, symbol: str) -> Dict[str, Any]:
        """Get 24h data for a specific symbol using the same API as analyze"""
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            end_time = int(datetime.now().timestamp() * 1000)
            start_time = end_time - (24 * 60 * 60 * 1000)  # 24 hours ago
            
            # Get 1-hour candles for the last 24 hours
            data = await self.get_historical_price_data_parallel(start_time, end_time, symbol, "1h")
            
            if not data:
                return None
            
            # Calculate 24h statistics
            first_price = data[0]["open"]
            last_price = data[-1]["close"]
            high_price = max(candle["high"] for candle in data)
            low_price = min(candle["low"] for candle in data)
            total_volume = sum(candle["volume"] for candle in data)
            
            price_change = last_price - first_price
            price_change_percent = (price_change / first_price) * 100 if first_price > 0 else 0
            
            return {
                "symbol": symbol,
                "price": last_price,
                "priceChange": price_change,
                "priceChangePercent": price_change_percent,
                "high24h": high_price,
                "low24h": low_price,
                "volume": total_volume,
                "openPrice": first_price,
                "closePrice": last_price,
                "candleCount": len(data)
            }
            
        except Exception as e:
            print(f"Error getting 24h data for {symbol}: {e}")
            return None
    
    async def get_available_symbols(self) -> List[Dict[str, Any]]:
        """Get all available USDT pairs with 24h data"""
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            # First get all available symbols
            async with self.session.get(f"{self.base_url}/exchangeInfo") as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                usdt_symbols = [
                    symbol["symbol"] for symbol in data["symbols"] 
                    if symbol["status"] == "TRADING" and symbol["symbol"].endswith("USDT")
                ]
            
            print(f"Found {len(usdt_symbols)} USDT trading pairs")
            
            # Get 24h data for all symbols in parallel
            tasks = []
            for symbol in usdt_symbols:
                task = self.get_symbol_24h_data(symbol)
                tasks.append(task)
            
            # Execute all tasks with semaphore to limit concurrent requests
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out errors and None results
            valid_results = []
            for result in results:
                if isinstance(result, dict) and result is not None:
                    valid_results.append(result)
                elif isinstance(result, Exception):
                    print(f"Error processing symbol: {result}")
            
            print(f"Successfully processed {len(valid_results)} symbols with 24h data")
            return sorted(valid_results, key=lambda x: x["symbol"])
            
        except Exception as e:
            print(f"Error fetching available symbols: {e}")
            return []
    
    def _get_interval_ms(self, interval: str) -> int:
        interval_map = {
            "1m": 60 * 1000,
            "5m": 5 * 60 * 1000,
            "15m": 15 * 60 * 1000,
            "1h": 60 * 60 * 1000,
            "4h": 4 * 60 * 60 * 1000,
            "1d": 24 * 60 * 60 * 1000
        }
        return interval_map.get(interval, 60 * 1000)
