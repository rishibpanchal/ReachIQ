"""
Companies Routes

Endpoints for company data management.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging

from services.database import get_company_features, get_all_companies, search_companies

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def get_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    """
    Get list of companies with pagination.
    
    Args:
        page: Page number (1-indexed)
        limit: Items per page
        search: Optional search query
        
    Returns:
        List of companies
    """
    try:
        if search:
            companies = search_companies(search, limit)
            total = len(companies)
        else:
            all_companies = get_all_companies()
            total = len(all_companies)
            
            # Apply pagination
            start = (page - 1) * limit
            end = start + limit
            companies = all_companies[start:end]
        
        return {
            "status": "success",
            "data": {
                "companies": companies,
                "total": total,
                "page": page,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching companies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{company_id}")
async def get_company(company_id: str):
    """
    Get specific company by ID.
    
    Args:
        company_id: Unique company identifier
        
    Returns:
        Company details
    """
    try:
        company = get_company_features(company_id)
        
        if not company:
            raise HTTPException(
                status_code=404,
                detail=f"Company {company_id} not found"
            )
        
        return {
            "status": "success",
            "data": company
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching company: {e}")
        raise HTTPException(status_code=500, detail=str(e))
