# Growth Curve Prediction System

## Overview

The Growth Curve Prediction System is a comprehensive ML-powered solution that dynamically predicts response probabilities across outreach sequences and determines optimal stopping points using probabilistic modeling and marginal utility analysis.

## Key Features

- **Dynamic Probability Prediction**: No hardcoded values - all probabilities computed using ML model inference
- **Exponential Decay Modeling**: Applies decay factors based on engagement and historical data
- **Optimal Stopping Algorithm**: Mathematical optimization using marginal gain analysis
- **Real-time Visualization**: Interactive charts showing probability curves and stopping points
- **Channel Effectiveness Analysis**: Adaptive predictions based on channel type and company profile

## Architecture

### Backend (FastAPI)

#### Module Structure

```
Backend/
├── services/
│   ├── growth_prediction/
│   │   ├── __init__.py
│   │   ├── growth_model.py          # ML model loader and manager
│   │   ├── probability_engine.py    # Feature engineering and probability computation
│   │   ├── sequence_optimizer.py    # Optimal stopping algorithm
│   │   └── growth_pipeline.py       # End-to-end orchestrator
│   └── database.py                  # Database access layer
├── routes/
│   ├── analytics.py                 # Growth curve API endpoints
│   ├── companies.py                 # Company data endpoints
│   └── dashboard.py                 # Dashboard statistics
└── main.py                          # FastAPI application
```

#### Core Components

##### 1. Growth Model (`growth_model.py`)

**Purpose**: Manages the machine learning model for response probability predictions.

**Key Functions**:
- `GrowthModelManager`: Singleton class managing model lifecycle
- `predict_response_probability(features)`: Returns probability from 0 to 1
- `_create_fallback_model()`: Creates simple model when main model unavailable

**Model Requirements**:
- Must support `predict_proba()` method
- Trained on historical outreach data
- Feature vector: [intent_score, signal_strength, engagement_score, channel_type, step_number, time_since_last, historical_response_rate, sequence_position]

##### 2. Probability Engine (`probability_engine.py`)

**Purpose**: Handles feature engineering and probability decay modeling.

**Key Functions**:

```python
compute_step_features(company_features, step_number, channel, historical_data)
```
- Constructs 8-dimensional feature vector
- Normalizes company-level features
- Encodes channel type
- Computes time decay factors

```python
apply_decay_model(base_probability, step_number, company_features, historical_data)
```
- Formula: `adjusted_prob = base_prob * exp(-decay_factor * step_number)`
- Decay factor computed dynamically from engagement and history
- Ensures minimum probability floor (1%)

**Decay Factor Calculation**:
```
decay_factor = base_decay 
               - 0.2 * engagement_score
               - 0.15 * historical_response_rate
               - 0.1 * intent_score
```

##### 3. Sequence Optimizer (`sequence_optimizer.py`)

**Purpose**: Determines optimal stopping point using marginal utility analysis.

**Algorithm**:

1. Compute marginal gains:
   ```
   gain(step_n) = probability(step_n) - probability(step_n+1)
   ```

2. Find stopping point:
   ```
   stop when gain < stopping_threshold
   ```

3. Dynamic threshold computation:
   ```
   threshold = base_threshold
               - 0.02 * intent_score
               - 0.015 * engagement_score
               + size_adjustment
               - 0.01 * historical_response_rate
   ```

**Key Functions**:
- `find_optimal_stopping_point()`: Returns optimal step and analysis
- `_compute_marginal_gains()`: Calculates gain at each transition
- `_compute_stopping_threshold()`: Dynamic threshold based on company profile
- `analyze_sequence_efficiency()`: ROI and efficiency metrics

##### 4. Growth Pipeline (`growth_pipeline.py`)

**Purpose**: End-to-end orchestration of the prediction process.

**Workflow**:
1. Fetch company features from database
2. Fetch historical engagement data
3. For each outreach step:
   - Compute feature vector
   - Get base probability from ML model
   - Apply decay model
   - Apply channel effectiveness
4. Find optimal stopping point
5. Compute additional metrics
6. Return structured response

### Frontend (React + TypeScript)

#### Component: `GrowthCurvePrediction.tsx`

**Purpose**: Visualizes growth curve predictions with interactive charts.

**Key Features**:
- **Response Probability Curve**: AreaChart showing step-by-step and cumulative probabilities
- **Marginal Gain Analysis**: BarChart visualizing diminishing returns
- **Key Metrics Cards**: Optimal stop point, ROI score, steps saved, efficiency
- **Step-by-Step Breakdown**: Detailed probability analysis per step

**Data Flow**:
```
Component → React Query → API: /api/analytics/growth-curve/{company_id} → Backend Pipeline → Response
```

**Visualization Libraries**:
- Recharts: Charts and graphs
- Framer Motion: Animations
- Lucide React: Icons

## API Endpoints

### `GET /api/analytics/growth-curve/{company_id}`

**Description**: Get growth curve prediction for a specific company.

**Response**:
```json
{
  "status": "success",
  "data": {
    "company_id": "company_1",
    "steps": [
      {
        "step": 1,
        "channel": "LinkedIn",
        "probability": 0.38,
        "base_probability": 0.42,
        "decay_adjusted": 0.40,
        "channel_effectiveness": 0.95
      },
      ...
    ],
    "optimal_stopping_point": 3,
    "stopping_reason": "Marginal gain drops from 16.0% to 3.2%, below threshold of 5.0%",
    "expected_total_response_probability": 0.74,
    "roi_score": 0.247,
    "marginal_gains": [0.16, 0.08, 0.032],
    "stopping_threshold": 0.05,
    "metrics": {
      "cumulative_probability": [0.38, 0.60, 0.74, 0.80],
      "optimal_probability": 0.74,
      "diminishing_returns_rate": 0.158,
      "wasted_effort_ratio": 0.081,
      "efficiency_score": 0.247,
      "total_steps": 4,
      "steps_saved": 1
    }
  }
}
```

### `POST /api/analytics/growth-curve/custom`

**Description**: Predict growth curve with custom parameters.

**Request Body**:
```json
{
  "company_features": {
    "intent_score": 85,
    "signal_strength": 78,
    "engagement_score": 72,
    "industry": "Technology",
    "company_size": "large"
  },
  "outreach_sequence": [
    {"step": 1, "channel": "LinkedIn"},
    {"step": 2, "channel": "Email"},
    {"step": 3, "channel": "Phone"}
  ],
  "historical_data": {
    "response_rate": 0.32,
    "last_contact_time": "2026-02-15T10:30:00Z"
  }
}
```

### `GET /api/analytics/growth-curve/batch?company_ids=id1,id2,id3`

**Description**: Get growth curves for multiple companies in batch.

**Query Parameters**:
- `company_ids`: Comma-separated list of company IDs (max 50)

## Installation & Setup

### Backend Setup

1. **Install Dependencies**:
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Start Server**:
   ```bash
   python main.py
   ```
   or
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **API Documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd Frontend
   npm install
   ```

2. **Configure Environment**:
   Create `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Analytics Page**:
   Navigate to: http://localhost:5173/analytics

## Mathematical Foundation

### Probability Decay Model

The system uses an exponential decay model to account for diminishing response likelihood:

```
P_adjusted(n) = P_base(n) × e^(-λ × (n-1))
```

Where:
- `P_adjusted(n)`: Adjusted probability at step n
- `P_base(n)`: Base probability from ML model
- `λ`: Dynamic decay factor
- `n`: Step number (1-indexed)

### Decay Factor Computation

```
λ = λ_base - α₁×E - α₂×R - α₃×I
```

Where:
- `λ_base = 0.3`: Base decay rate
- `E`: Engagement score (0-1)
- `R`: Historical response rate (0-1)
- `I`: Intent score (0-1)
- `α₁ = 0.2, α₂ = 0.15, α₃ = 0.1`: Weight factors

### Marginal Utility Analysis

The optimal stopping point is determined by:

```
G(n) = P(n) - P(n+1)
```

Stop when:
```
G(n) < θ
```

Where:
- `G(n)`: Marginal gain at step n
- `θ`: Dynamic stopping threshold

### Dynamic Threshold

```
θ = θ_base - β₁×I - β₂×E + β₃×S - β₄×R
```

Where:
- `θ_base = 0.05`: Base threshold (5%)
- `S`: Company size adjustment
- `β₁ = 0.02, β₂ = 0.015, β₃ = varies, β₄ = 0.01`

## Performance Optimization

### Backend
- **Model Caching**: Singleton pattern for model manager
- **Async Endpoints**: All routes use FastAPI async pattern
- **Batch Processing**: Efficient batch prediction endpoint
- **Feature Computation**: Vectorized numpy operations

### Frontend
- **React Query**: Automatic caching and refetching (5-minute stale time)
- **Code Splitting**: Lazy loading of heavy components
- **Memoization**: useMemo for chart data transformation
- **Debouncing**: Search and filter operations debounced

## Customization

### Adding New Channels

Edit `probability_engine.py`:
```python
self.channel_encoding = {
    "linkedin": 0.8,
    "email": 0.7,
    "your_new_channel": 0.75,  # Add here
}
```

### Adjusting Decay Parameters

Edit `probability_engine.py` in `_compute_decay_factor()`:
```python
base_decay = 0.3  # Increase for faster decay
engagement_adjustment = -0.2 * engagement_score  # Adjust weight
```

### Custom Stopping Thresholds

Edit `sequence_optimizer.py` in `__init__()`:
```python
self.default_stopping_threshold = 0.05  # 5% - adjust as needed
```

## Future Enhancements

1. **A/B Testing Integration**: Test different sequences and track results
2. **Real-time Model Retraining**: Update model with new interaction data
3. **Multi-objective Optimization**: Balance conversion vs. cost
4. **Personalization**: Company-specific decay and threshold models
5. **Confidence Intervals**: Probabilistic uncertainty quantification
6. **Simulation Mode**: What-if analysis for different strategies

## Troubleshooting

### Backend Issues

**Model Not Loading**:
- Check model path in `growth_model.py`
- Fallback model automatically created if main model missing
- Check logs for model loading errors

**Predictions Seem Off**:
- Verify feature normalization (scores should be 0-100)
- Check historical data format (timestamps in ISO format)
- Review decay factor computation

### Frontend Issues

**Component Not Rendering**:
- Check API endpoint connectivity
- Verify VITE_API_BASE_URL in .env
- Check browser console for errors

**Charts Not Displaying**:
- Ensure recharts is installed: `npm install recharts`
- Verify data format matches interface definitions
- Check CSS for height/width issues

## License

MIT License - see LICENSE file for details.

## Authors

PolyDeal Development Team

## Support

For issues and questions:
- GitHub Issues: [Project URL]
- Documentation: [Docs URL]
- Email: support@polydeal.com
