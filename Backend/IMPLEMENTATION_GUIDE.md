"""
IMPLEMENTATION GUIDE - DYNAMIC CHANNEL OUTREACH ENGINE
======================================================

Quick start guide for using the enhanced PolyDeal Outreach Engine
with dynamic channel prediction.

================================================================================
SECTION 1: BACKEND USAGE
================================================================================

STEP 1: Importing the Components
--------------------------------

from services.growth_prediction import (
    get_growth_pipeline,
    get_channel_predictor,
    get_sequence_builder,
    get_priority_weighting_engine
)

STEP 2: Getting Top Channels
----------------------------

# Initialize pipeline
pipeline = get_growth_pipeline()

# Get top 2 channels for a buyer
company_features = {
    'id': 'BUY_12345',
    'industry': 'Technology',
    'company_size': 'medium',
    'intent_score': 75,
    'signal_strength': 82,
    'engagement_score': 65,
    'max_outreach_steps': 5
}

historical_data = {
    'channel_performance': {
        'LinkedIn': {'response_rate': 0.35},
        'Email': {'response_rate': 0.25}
    }
}

top_channels = pipeline.predict_top_channels(
    company_id='BUY_12345',
    company_features=company_features,
    historical_data=historical_data,
    num_channels=2
)

# Result:
# [
#     {'name': 'LinkedIn', 'score': 0.82, 'reasoning': '...'},
#     {'name': 'Email', 'score': 0.61, 'reasoning': '...'}
# ]

STEP 3: Building Dynamic Sequence
---------------------------------

sequence_builder = get_sequence_builder()
sequence = sequence_builder.build_sequence(top_channels)

# Result: 4-stage sequence
# [
#     {
#         'step': 1,
#         'channel': 'LinkedIn',
#         'channel_score': 0.82,
#         'type': 'initial',
#         'display_name': 'LinkedIn Initial Contact',
#         'is_primary': True
#     },
#     ...
# ]

STEP 4: Computing Growth Curve with Priority Weighting
------------------------------------------------------

# The pipeline now handles everything automatically!
growth_curve = pipeline.predict_growth_curve(
    company_id='BUY_12345',
    company_features=company_features,
    outreach_sequence=None,  # Will be built dynamically
    historical_data=historical_data,
    use_dynamic_channels=True  # Enable dynamic mode
)

# Result includes:
# - steps with priority-weighted probabilities
# - optimal_stopping_point
# - channel_scores and is_primary_channel flags
# - marginal_gains and cumulative_probabilities
# - roi_score and efficiency metrics

================================================================================
SECTION 2: API USAGE (curl examples)
================================================================================

GET TOP CHANNELS
----------------

curl -X GET "http://localhost:8000/api/analytics/outreach/top-channels/BUY_12345?num_channels=2" \
  -H "Accept: application/json"

Response:
{
  "status": "success",
  "data": {
    "company_id": "BUY_12345",
    "top_channels": [
      {
        "name": "LinkedIn",
        "score": 0.82,
        "reasoning": "LinkedIn is highly recommended..."
      },
      {
        "name": "Email",
        "score": 0.61,
        "reasoning": "Email is suitable for..."
      }
    ],
    "total_channels_evaluated": 6,
    "note": "Channels are dynamically predicted..."
  }
}

GET OUTREACH SEQUENCE
--------------------

curl -X GET "http://localhost:8000/api/analytics/outreach/sequence/BUY_12345" \
  -H "Accept: application/json"

Response:
{
  "status": "success",
  "data": {
    "company_id": "BUY_12345",
    "sequence": [
      {
        "step": 1,
        "channel": "LinkedIn",
        "channel_score": 0.82,
        "type": "initial",
        "display_name": "LinkedIn Initial",
        "is_primary": true
      },
      ...
    ],
    "primary_channel": "LinkedIn",
    "secondary_channel": "Email",
    "total_stages": 4
  }
}

GET GROWTH CURVE (WITH DYNAMIC CHANNELS)
----------------------------------------

curl -X GET "http://localhost:8000/api/analytics/growth-curve/BUY_12345?use_dynamic_channels=true" \
  -H "Accept: application/json"

Response includes:
{
  "status": "success",
  "data": {
    "company_id": "BUY_12345",
    "steps": [
      {
        "step": 1,
        "channel": "LinkedIn",
        "display_name": "LinkedIn Initial",
        "probability": 0.42,
        "channel_score": 0.82,
        "is_primary_channel": true,
        "channel_weight": 1.14,
        ...
      },
      ...
    ],
    "optimal_stopping_point": 3,
    "expected_total_response_probability": 0.68,
    "dynamic_sequence_used": true,
    ...
  }
}

BATCH GROWTH CURVES
-------------------

curl -X GET "http://localhost:8000/api/analytics/growth-curve/batch?company_ids=BUY_1&company_ids=BUY_2&company_ids=BUY_3" \
  -H "Accept: application/json"

================================================================================
SECTION 3: FRONTEND USAGE
================================================================================

Using GrowthCurvePrediction Component
-------------------------------------

import GrowthCurvePrediction from '@/components/analytics/GrowthCurvePrediction'

// In your component
export default function AnalyticsPage() {
  const companyId = 'BUY_12345'
  
  return (
    <div>
      <h1>Analytics</h1>
      {/* Component automatically:
          - Fetches growth curve with dynamic channels
          - Displays channel names (not hardcoded)
          - Shows primary vs secondary visual distinction
          - Displays channel scores and confidence
      */}
      <GrowthCurvePrediction companyId={companyId} />
    </div>
  )
}

The component will:
1. Call GET /api/analytics/growth-curve/{companyId}
2. Display dynamic channel names from the response
3. Apply color coding:
   - Blue tone for primary channel
   - Lighter blue for secondary channel
4. Show "Primary Channel" / "Secondary Channel" badges
5. Display channel scores and weights
6. Plot probability curves with proper labels

================================================================================
SECTION 4: CUSTOMIZATION EXAMPLES
================================================================================

CUSTOM CHANNEL SCORING
----------------------

from services.growth_prediction import get_channel_predictor

predictor = get_channel_predictor()

# Get scores for specific channels
company_features = {
    'industry': 'Finance',
    'company_size': 'enterprise',
    'intent_score': 85,
    'signal_strength': 90,
    'engagement_score': 70
}

top_channels = predictor.predict_top_channels(
    company_features=company_features,
    num_channels=3  # Get top 3 instead of 2
)

CUSTOM PROBABILITY WEIGHTING
-----------------------------

from services.growth_prediction import get_priority_weighting_engine

weighting_engine = get_priority_weighting_engine()

# Change follow-up decay factor
weighting_engine.set_followup_decay(0.8)  # 20% reduction instead of 30%

# Apply custom weights
sequence = [...]  # Your sequence
base_probs = [0.45, 0.38, 0.42, 0.35]  # Your base probabilities

weighted_sequence = weighting_engine.apply_weights_to_sequence(
    base_probs,
    sequence
)

# Get cumulative probabilities
cumulative_probs = weighting_engine.compute_cumulative_probability(
    [step['priority_adjusted_probability'] for step in weighted_sequence]
)

CUSTOM GROWTH CURVE
-------------------

from services.growth_prediction import get_growth_pipeline

pipeline = get_growth_pipeline()

# Option 1: Fully dynamic (recommended)
result = pipeline.predict_growth_curve(
    company_id='BUY_12345',
    company_features=company_features,
    outreach_sequence=None,  # Auto-generates from top channels
    historical_data=historical_data,
    use_dynamic_channels=True
)

# Option 2: Legacy mode (hardcoded channels)
result = pipeline.predict_growth_curve(
    company_id='BUY_12345',
    company_features=company_features,
    outreach_sequence=None,
    historical_data=historical_data,
    use_dynamic_channels=False
)

# Option 3: Custom sequence (don't predict channels)
custom_sequence = [
    {'step': 1, 'channel': 'Phone', 'type': 'initial'},
    {'step': 2, 'channel': 'Email', 'type': 'followup'},
    {'step': 3, 'channel': 'LinkedIn', 'type': 'initial'},
    {'step': 4, 'channel': 'Phone', 'type': 'followup'}
]

result = pipeline.predict_growth_curve(
    company_id='BUY_12345',
    company_features=company_features,
    outreach_sequence=custom_sequence,
    historical_data=historical_data,
    use_dynamic_channels=False  # Don't predict, use custom
)

================================================================================
SECTION 5: DEBUGGING & TROUBLESHOOTING
================================================================================

CHECK CHANNEL PREDICTIONS
-------------------------

from services.growth_prediction import get_channel_predictor
from services.database import get_company_features, get_historical_data

company_id = 'BUY_12345'
features = get_company_features(company_id)
history = get_historical_data(company_id)

predictor = get_channel_predictor()
channels = predictor.predict_top_channels(features, history)

print(f"Top channels: {[c['name'] for c in channels]}")
print(f"Scores: {[c['score'] for c in channels]}")
print(f"Reasoning: {[c['reasoning'] for c in channels]}")

CHECK SEQUENCE BUILDING
----------------------

from services.growth_prediction import get_sequence_builder

builder = get_sequence_builder()
sequence = builder.build_sequence(channels)

for step in sequence:
    print(f"Step {step['step']}: {step['display_name']} "
          f"({step['channel']}, score={step['channel_score']}, "
          f"primary={step['is_primary']})")

# Validate structure
try:
    builder.validate_sequence(sequence)
    print("Sequence is valid!")
except ValueError as e:
    print(f"Sequence validation failed: {e}")

CHECK PROBABILITY CALCULATIONS
------------------------------

from services.growth_prediction import get_priority_weighting_engine

engine = get_priority_weighting_engine()

# Test weight calculation
channel_score = 0.82
base_prob = 0.45
step_type = 'initial'

adjusted = engine.apply_channel_priority_weight(
    base_prob,
    channel_score,
    step_type
)

print(f"Base: {base_prob:.4f}, Score: {channel_score:.4f}")
print(f"Adjusted (initial): {adjusted:.4f}")

# Test with followup
adjusted_followup = engine.apply_channel_priority_weight(
    base_prob,
    channel_score,
    'followup'
)
print(f"Adjusted (followup): {adjusted_followup:.4f}")

ENABLE DEBUG LOGGING
-------------------

import logging

# Set logging level to DEBUG for growth prediction modules
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('services.growth_prediction')
logger.setLevel(logging.DEBUG)

# Now all debug logs will be printed
pipeline = get_growth_pipeline()
result = pipeline.predict_growth_curve(...)

================================================================================
SECTION 6: COMMON PATTERNS
================================================================================

PATTERN 1: Get channels and sequence separately
----------------------------------------------

# Useful when you want to show channels to user before running full prediction

from fastapi import APIRouter
router = APIRouter()

@router.get("/buyer/{buyer_id}/channels")
async def get_buyer_channels(buyer_id: str):
    from services.database import get_company_features, get_historical_data
    from services.growth_prediction import get_growth_pipeline
    
    features = get_company_features(buyer_id)
    history = get_historical_data(buyer_id)
    
    pipeline = get_growth_pipeline()
    channels = pipeline.predict_top_channels(
        buyer_id,
        features,
        history,
        num_channels=2
    )
    
    return {
        "buyer_id": buyer_id,
        "channels": channels
    }

@router.get("/buyer/{buyer_id}/growth-curve")
async def get_buyer_growth_curve(buyer_id: str):
    features = get_company_features(buyer_id)
    history = get_historical_data(buyer_id)
    
    pipeline = get_growth_pipeline()
    result = pipeline.predict_growth_curve(
        buyer_id,
        features,
        None,  # Dynamic
        history,
        use_dynamic_channels=True
    )
    
    return result

PATTERN 2: Batch predictions with channel caching
--------------------------------------------------

# Cache channels to avoid recalculating for same company

from functools import lru_cache

@lru_cache(maxsize=1000)
def get_cached_channels(company_id):
    from services.database import get_company_features, get_historical_data
    from services.growth_prediction import get_growth_pipeline
    
    features = get_company_features(company_id)
    history = get_historical_data(company_id)
    
    pipeline = get_growth_pipeline()
    return pipeline.predict_top_channels(
        company_id,
        features,
        history,
        num_channels=2
    )

PATTERN 3: A/B testing different channel combinations
-----------------------------------------------------

from services.growth_prediction import (
    get_sequence_builder,
    get_priority_weighting_engine
)

# Test different channel combinations
test_channels = [
    [
        {"name": "LinkedIn", "score": 0.82},
        {"name": "Email", "score": 0.61}
    ],
    [
        {"name": "Phone", "score": 0.80},
        {"name": "Email", "score": 0.61}
    ],
    [
        {"name": "LinkedIn", "score": 0.82},
        {"name": "Phone", "score": 0.80}
    ]
]

results = []

for channels in test_channels:
    sequence = get_sequence_builder().build_sequence(channels)
    # ... compute growth curve for this sequence
    results.append({
        "channels": [c["name"] for c in channels],
        "sequence": sequence,
        "performance": "..."  # Your metrics
    })

================================================================================
SECTION 7: PERFORMANCE TIPS
================================================================================

1. Use singleton instances (factory functions)
   - Avoids recreating ML models and expensive initializations
   - All factory functions return singletons

2. Cache company features in production
   - If database queries are slow, implement caching layer
   - Use @lru_cache or Redis for caching

3. Batch process when possible
   - POST /api/analytics/growth-curve/batch processes multiple companies
   - More efficient than individual calls

4. Limit channel predictions
   - Default num_channels=2 is optimal for 4-stage sequence
   - Predicting more channels is more computationally expensive

5. Monitor ML model loading
   - First request loads model from disk
   - Consider warming up model on service startup

6. Profile priority weighting
   - Most computationally expensive part is ML prediction
   - Priority weighting is lightweight and can be optimized

================================================================================
"""
