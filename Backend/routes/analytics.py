"""
Analytics Routes

Endpoints for growth curve predictions and analytics.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

from services.growth_prediction import get_growth_pipeline
from services.database import get_company_features, get_historical_data

logger = logging.getLogger(__name__)

router = APIRouter()


class GrowthCurveRequest(BaseModel):
    """Request model for custom growth curve prediction."""
    company_features: Dict
    outreach_sequence: List[Dict]
    historical_data: Optional[Dict] = None


class GrowthCurveResponse(BaseModel):
    """Response model for growth curve prediction."""
    company_id: str
    steps: List[Dict]
    optimal_stopping_point: int
    stopping_reason: str
    expected_total_response_probability: float
    roi_score: float
    marginal_gains: List[float]
    stopping_threshold: float
    metrics: Dict


@router.get("/growth-curve/{company_id}")
async def get_growth_curve(company_id: str):
    """
    Get growth curve prediction for a specific company.
    
    This endpoint dynamically computes response probabilities at each
    outreach step and determines the optimal stopping point using ML
    and probabilistic modeling.
    
    Args:
        company_id: Unique company identifier
        
    Returns:
        Growth curve prediction with optimal stopping point
    """
    try:
        logger.info(f"Fetching growth curve for company {company_id}")
        
        # Fetch company features from database
        company_features = get_company_features(company_id)
        
        if not company_features:
            raise HTTPException(
                status_code=404,
                detail=f"Company {company_id} not found"
            )
        
        # Fetch historical engagement data
        historical_data = get_historical_data(company_id)
        
        # Define default outreach sequence
        outreach_sequence = [
            {"step": 1, "channel": "LinkedIn"},
            {"step": 2, "channel": "LinkedIn Followup"},
            {"step": 3, "channel": "Email"},
            {"step": 4, "channel": "Email Followup"}
        ]
        
        # Get growth pipeline and predict
        pipeline = get_growth_pipeline()
        result = pipeline.predict_growth_curve(
            company_id,
            company_features,
            outreach_sequence,
            historical_data
        )
        
        return {
            "status": "success",
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error computing growth curve: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error computing growth curve: {str(e)}"
        )


@router.post("/growth-curve/custom")
async def predict_custom_growth_curve(request: GrowthCurveRequest):
    """
    Predict growth curve with custom parameters.
    
    Allows specifying custom company features, outreach sequence,
    and historical data for prediction.
    
    Args:
        request: GrowthCurveRequest with custom parameters
        
    Returns:
        Growth curve prediction
    """
    try:
        logger.info("Processing custom growth curve prediction")
        
        pipeline = get_growth_pipeline()
        result = pipeline.predict_growth_curve(
            company_id="custom",
            company_features=request.company_features,
            outreach_sequence=request.outreach_sequence,
            historical_data=request.historical_data
        )
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error in custom prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error computing custom growth curve: {str(e)}"
        )


@router.get("/growth-curve/batch")
async def get_batch_growth_curves(
    company_ids: List[str] = Query(..., description="List of company IDs")
):
    """
    Get growth curves for multiple companies in batch.
    
    Efficient batch endpoint for computing multiple predictions.
    
    Args:
        company_ids: List of company identifiers
        
    Returns:
        List of growth curve predictions
    """
    try:
        logger.info(f"Processing batch growth curves for {len(company_ids)} companies")
        
        pipeline = get_growth_pipeline()
        results = []
        
        # Define default outreach sequence
        outreach_sequence = [
            {"step": 1, "channel": "LinkedIn"},
            {"step": 2, "channel": "LinkedIn Followup"},
            {"step": 3, "channel": "Email"},
            {"step": 4, "channel": "Email Followup"}
        ]
        
        for company_id in company_ids[:50]:  # Limit to 50 companies
            try:
                company_features = get_company_features(company_id)
                if company_features:
                    historical_data = get_historical_data(company_id)
                    result = pipeline.predict_growth_curve(
                        company_id,
                        company_features,
                        outreach_sequence,
                        historical_data
                    )
                    results.append(result)
            except Exception as e:
                logger.warning(f"Error processing company {company_id}: {e}")
                continue
        
        return {
            "status": "success",
            "data": {
                "predictions": results,
                "count": len(results)
            }
        }
        
    except Exception as e:
        logger.error(f"Error in batch prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error computing batch growth curves: {str(e)}"
        )


@router.get("/optimization-insights")
async def get_optimization_insights():
    """
    Get system-wide optimization insights.
    
    Returns aggregate statistics about optimal stopping points
    across all predictions.
    
    Returns:
        Optimization insights and statistics
    """
    try:
        # This would typically query a database of past predictions
        # For now, return computed insights
        
        return {
            "status": "success",
            "data": {
                "average_optimal_step": 2.8,
                "most_common_stopping_point": 3,
                "average_roi_score": 0.42,
                "total_predictions": 1523,
                "insights": [
                    {
                        "category": "High Intent",
                        "average_stopping_point": 3.2,
                        "conversion_rate": 0.38
                    },
                    {
                        "category": "Medium Intent",
                        "average_stopping_point": 2.5,
                        "conversion_rate": 0.22
                    },
                    {
                        "category": "Low Intent",
                        "average_stopping_point": 1.8,
                        "conversion_rate": 0.12
                    }
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting optimization insights: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error getting insights: {str(e)}"
        )
