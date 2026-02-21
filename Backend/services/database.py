"""
Database Service - Mock Implementation

This module provides mock database access for company features
and historical engagement data.

In production, replace with actual database queries (PostgreSQL, MongoDB, etc.)
"""

from typing import Dict, Optional
import random
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


# Mock database of companies
MOCK_COMPANIES = {}

# Generate some mock companies
def _initialize_mock_data():
    """Initialize mock company data."""
    global MOCK_COMPANIES
    
    industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']
    sizes = ['small', 'medium', 'large', 'enterprise']
    
    for i in range(1, 101):
        company_id = f"company_{i}"
        MOCK_COMPANIES[company_id] = {
            'id': company_id,
            'name': f'Company {i}',
            'industry': random.choice(industries),
            'company_size': random.choice(sizes),
            'intent_score': random.randint(30, 95),
            'signal_strength': random.randint(40, 90),
            'engagement_score': random.randint(20, 85),
            'max_outreach_steps': 5,
            'location': 'USA'
        }

# Initialize on module load
_initialize_mock_data()


def get_company_features(company_id: str) -> Optional[Dict]:
    """
    Fetch company features from database.
    
    Args:
        company_id: Unique company identifier (supports both 'company_X' and 'BUY_XXXXX' formats)
        
    Returns:
        Dictionary of company features or None if not found
    """
    try:
        # Handle buyer ID format (BUY_XXXXX) - extract number and map to company
        if company_id.startswith('BUY_'):
            # Extract the numeric part and map to company ID
            buyer_num = company_id.replace('BUY_', '')
            # Use modulo to map to our company range (1-100)
            company_num = (int(buyer_num) % 100) + 1
            mapped_company_id = f'company_{company_num}'
            logger.info(f"Mapped buyer ID {company_id} to {mapped_company_id}")
            company_id = mapped_company_id
        
        # In production, query actual database
        # Example: SELECT * FROM companies WHERE id = company_id
        
        if company_id in MOCK_COMPANIES:
            return MOCK_COMPANIES[company_id]
        
        # If not in mock data, create on-the-fly with unique features per buyer
        logger.info(f"Creating mock data for company {company_id}")
        
        # Generate unique features based on ID hash for consistency
        import hashlib
        id_hash = int(hashlib.md5(company_id.encode()).hexdigest()[:8], 16)
        
        # Use hash to generate consistent but varied features
        company_features = {
            'id': company_id,
            'name': f'Company {company_id}',
            'industry': ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'][id_hash % 5],
            'company_size': ['small', 'medium', 'large', 'enterprise'][id_hash % 4],
            'intent_score': 30 + (id_hash % 66),  # 30-95
            'signal_strength': 40 + (id_hash % 51),  # 40-90
            'engagement_score': 20 + (id_hash % 66),  # 20-85
            'max_outreach_steps': 5,
            'location': 'USA'
        }
        
        MOCK_COMPANIES[company_id] = company_features
        return company_features
        
    except Exception as e:
        logger.error(f"Error fetching company features: {e}")
        return None


def get_historical_data(company_id: str) -> Optional[Dict]:
    """
    Fetch historical engagement data for a company.
    
    Args:
        company_id: Unique company identifier (supports both 'company_X' and 'BUY_XXXXX' formats)
        
    Returns:
        Dictionary with historical data or None
    """
    try:
        # Handle buyer ID format
        if company_id.startswith('BUY_'):
            buyer_num = company_id.replace('BUY_', '')
            company_num = (int(buyer_num) % 100) + 1
            company_id = f'company_{company_num}'
        
        # In production, query engagement history
        # Example: SELECT * FROM engagement_history WHERE company_id = company_id
        
        # Generate mock historical data with some variation based on company ID
        import hashlib
        id_hash = int(hashlib.md5(company_id.encode()).hexdigest()[:8], 16)
        
        has_history = (id_hash % 10) > 2  # 70% have some history
        
        if not has_history:
            return None
        
        # Last contact time (0-30 days ago) - consistent per ID
        days_ago = id_hash % 31  # 0-30 days
        last_contact_time = datetime.now() - timedelta(days=days_ago)
        
        historical_data = {
            'response_rate': 0.1 + ((id_hash % 40) / 100),  # 0.1 to 0.5
            'last_contact_time': last_contact_time.isoformat(),
            'total_contacts': 1 + (id_hash % 10),
            'successful_contacts': (id_hash % 6),
            'average_response_time_hours': 2 + (id_hash % 71)  # 2-72 hours
        }
        
        return historical_data
        
    except Exception as e:
        logger.error(f"Error fetching historical data: {e}")
        return None


def get_all_companies() -> list:
    """Get all companies from database."""
    return list(MOCK_COMPANIES.values())


def search_companies(query: str, limit: int = 10) -> list:
    """
    Search companies by name or industry.
    
    Args:
        query: Search query string
        limit: Maximum results to return
        
    Returns:
        List of matching companies
    """
    query_lower = query.lower()
    results = []
    
    for company in MOCK_COMPANIES.values():
        if (query_lower in company['name'].lower() or 
            query_lower in company['industry'].lower()):
            results.append(company)
            
            if len(results) >= limit:
                break
    
    return results
