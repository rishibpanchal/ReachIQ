"""
Dashboard Routes

Endpoints for dashboard statistics and metrics.
"""

from fastapi import APIRouter, HTTPException
import logging

from services.database import get_all_companies

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """
    Get dashboard statistics.
    
    Returns:
        Dashboard metrics and statistics
    """
    try:
        companies = get_all_companies()
        
        # Compute statistics
        total_companies = len(companies)
        high_intent = sum(1 for c in companies if c['intent_score'] >= 75)
        medium_intent = sum(1 for c in companies if 50 <= c['intent_score'] < 75)
        low_intent = sum(1 for c in companies if c['intent_score'] < 50)
        
        # Intent distribution
        intent_distribution = [
            {"name": "High Intent", "value": high_intent, "color": "#22c55e"},
            {"name": "Medium Intent", "value": medium_intent, "color": "#eab308"},
            {"name": "Low Intent", "value": low_intent, "color": "#ef4444"}
        ]
        
        # Channel effectiveness (mock data)
        channel_effectiveness = [
            {"channel": "LinkedIn", "effectiveness": 85, "count": 234},
            {"channel": "Email", "effectiveness": 72, "count": 456},
            {"channel": "Phone", "effectiveness": 91, "count": 123},
            {"channel": "WhatsApp", "effectiveness": 78, "count": 189}
        ]
        
        # Success rate trend (mock data)
        success_rate_trend = [
            {"date": "Jan", "rate": 32},
            {"date": "Feb", "rate": 38},
            {"date": "Mar", "rate": 42},
            {"date": "Apr", "rate": 45},
            {"date": "May", "rate": 48},
            {"date": "Jun", "rate": 52}
        ]
        
        return {
            "status": "success",
            "data": {
                "total_companies": total_companies,
                "high_intent_companies": high_intent,
                "medium_intent_companies": medium_intent,
                "low_intent_companies": low_intent,
                "intent_distribution": intent_distribution,
                "channel_effectiveness": channel_effectiveness,
                "success_rate_trend": success_rate_trend
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
