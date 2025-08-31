from datetime import datetime
from fastapi import HTTPException


def convert_date_to_timestamp(date_str: str) -> int:
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return int(dt.timestamp() * 1000)
    except:
        raise HTTPException(
            status_code=400, 
            detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
        )
