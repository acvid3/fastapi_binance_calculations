from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from ..models.investment_models import InvestmentParams, AnalysisResult
from ..services.async_investment_analysis_service import AsyncInvestmentAnalysisService
from ..repositories.async_binance_repository import AsyncBinanceRepository

root_router = APIRouter(tags=["root"])
api_router = APIRouter(prefix="/api", tags=["investment"])


def get_investment_service():
    return AsyncInvestmentAnalysisService()


@root_router.get("/")
async def root():
    return {
        "message": "Investment Analysis API", 
        "version": "1.0.0",
        "deployment": "AWS"
    }


@root_router.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat()
    }


@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze_investments(
    params: InvestmentParams,
    service: AsyncInvestmentAnalysisService = Depends(get_investment_service)
):
    try:
        from ..utils.date_utils import convert_date_to_timestamp
        
        start_timestamp = convert_date_to_timestamp(params.start_date)
        end_timestamp = convert_date_to_timestamp(params.end_date)
        
        params.set_timestamps(start_timestamp, end_timestamp)
        
        result = await service.analyze_investment_strategy(params)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/symbols")
async def get_available_symbols():
    try:
        async with AsyncBinanceRepository() as binance_repo:
            symbols = await binance_repo.get_available_symbols()
            return {"symbols": symbols}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
