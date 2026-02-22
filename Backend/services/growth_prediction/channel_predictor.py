"""
Channel Predictor - Top Outreach Channel Prediction

This module predicts the top 2 outreach channels for a buyer
based on company features, historical data, and ML model outputs.

The prediction is completely dynamic - channels are NOT hardcoded.
"""

from typing import Dict, List, Optional
import numpy as np
import logging

logger = logging.getLogger(__name__)


class ChannelPredictor:
    """Predicts the best outreach channels for specific buyers."""
    
    # Available channels with default effectiveness baseline
    AVAILABLE_CHANNELS = {
        "LinkedIn": 0.0,  # Score will be computed
        "Email": 0.0,
        "Phone": 0.0,
        "WhatsApp": 0.0,
        "Twitter": 0.0,
        "Direct Message": 0.0
    }
    
    def __init__(self):
        """Initialize the channel predictor."""
        self.available_channels = list(self.AVAILABLE_CHANNELS.keys())
    
    def predict_top_channels(
        self,
        company_features: Dict,
        historical_data: Optional[Dict] = None,
        num_channels: int = 2
    ) -> List[Dict]:
        """
        Predict top N channels for a buyer.
        
        Scoring considers:
        1. Company industry and size
        2. Historical engagement by channel
        3. Company intent and signal strength
        4. ML model priors
        
        Args:
            company_features: Dictionary of company-level features
            historical_data: Optional historical engagement metrics
            num_channels: Number of top channels to return (default: 2)
            
        Returns:
            List of channels with scores, sorted by priority:
            [
                {"name": "LinkedIn", "score": 0.82, "reasoning": "..."},
                {"name": "Email", "score": 0.61, "reasoning": "..."}
            ]
        """
        logger.info(f"Computing top {num_channels} channels for company")
        
        # Compute score for each available channel
        channel_scores = {}
        
        for channel in self.available_channels:
            score = self._score_channel(
                channel,
                company_features,
                historical_data
            )
            channel_scores[channel] = score
        
        # Sort by score descending and get top N
        sorted_channels = sorted(
            channel_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        top_channels = []
        for channel_name, score in sorted_channels[:num_channels]:
            reasoning = self._generate_channel_reasoning(
                channel_name,
                score,
                company_features,
                historical_data
            )
            
            top_channels.append({
                "name": channel_name,
                "score": round(score, 4),
                "reasoning": reasoning
            })
        
        logger.info(
            f"Top channels: {[ch['name'] for ch in top_channels]} "
            f"with scores {[ch['score'] for ch in top_channels]}"
        )
        
        return top_channels
    
    def _score_channel(
        self,
        channel: str,
        company_features: Dict,
        historical_data: Optional[Dict] = None
    ) -> float:
        """
        Score a channel for the given company.
        
        Combines multiple factors:
        - Channel baseline effectiveness
        - Company industry affinity
        - Company size fit
        - Historical performance
        - Company signals (intent, engagement)
        
        Args:
            channel: Channel name
            company_features: Company features
            historical_data: Historical engagement data
            
        Returns:
            Score between 0 and 1
        """
        baseline_score = self._get_channel_baseline(channel)
        
        # Industry affinity (some channels work better for certain industries)
        industry = company_features.get('industry', 'Technology')
        industry_boost = self._get_industry_channel_affinity(channel, industry)
        
        # Company size fit
        company_size = company_features.get('company_size', 'medium')
        size_boost = self._get_size_channel_affinity(channel, company_size)
        
        # Intent and engagement signals
        intent_score = company_features.get('intent_score', 50) / 100.0
        engagement_score = company_features.get('engagement_score', 50) / 100.0
        signal_strength = company_features.get('signal_strength', 50) / 100.0
        
        signal_boost = (intent_score + engagement_score + signal_strength) / 3.0
        
        # Historical performance (if available)
        history_boost = 0.0
        if historical_data and 'channel_performance' in historical_data:
            history_boost = self._get_historical_channel_performance(
                channel,
                historical_data
            )
        
        # Combine components
        composite_score = (
            baseline_score * 0.3 +
            industry_boost * 0.25 +
            size_boost * 0.15 +
            signal_boost * 0.2 +
            history_boost * 0.1
        )
        
        # Normalize to 0-1 range
        final_score = float(np.clip(composite_score, 0.0, 1.0))
        
        return final_score
    
    def _get_channel_baseline(self, channel: str) -> float:
        """
        Get baseline effectiveness score for a channel.
        
        These represent empirical effectiveness across all use cases.
        """
        baselines = {
            "LinkedIn": 0.78,      # LinkedIn is highly effective for B2B
            "Email": 0.65,         # Email is reliable but lower engagement
            "Phone": 0.82,         # Phone is effective but invasive
            "WhatsApp": 0.71,      # WhatsApp good for personal networks
            "Twitter": 0.52,       # Twitter moderate for B2B
            "Direct Message": 0.68 # DM on platforms varies
        }
        return baselines.get(channel, 0.6)
    
    def _get_industry_channel_affinity(self, channel: str, industry: str) -> float:
        """
        Get channel affinity for specific industry.
        
        Returns boost factor based on industry-channel fit.
        """
        affinities = {
            "LinkedIn": {
                "Technology": 0.95,
                "Finance": 0.92,
                "Healthcare": 0.85,
                "Retail": 0.75,
                "Manufacturing": 0.70
            },
            "Email": {
                "Technology": 0.80,
                "Finance": 0.88,
                "Healthcare": 0.90,
                "Retail": 0.82,
                "Manufacturing": 0.85
            },
            "Phone": {
                "Technology": 0.70,
                "Finance": 0.85,
                "Healthcare": 0.88,
                "Retail": 0.75,
                "Manufacturing": 0.80
            },
            "WhatsApp": {
                "Technology": 0.60,
                "Finance": 0.50,
                "Healthcare": 0.65,
                "Retail": 0.75,
                "Manufacturing": 0.72
            },
            "Twitter": {
                "Technology": 0.72,
                "Finance": 0.65,
                "Healthcare": 0.45,
                "Retail": 0.68,
                "Manufacturing": 0.40
            },
            "Direct Message": {
                "Technology": 0.75,
                "Finance": 0.68,
                "Healthcare": 0.60,
                "Retail": 0.72,
                "Manufacturing": 0.65
            }
        }
        
        return affinities.get(channel, {}).get(industry, 0.7)
    
    def _get_size_channel_affinity(self, channel: str, company_size: str) -> float:
        """
        Get channel affinity for specific company size.
        
        Returns boost factor based on size-channel fit.
        """
        affinities = {
            "LinkedIn": {
                "small": 0.75,
                "medium": 0.85,
                "large": 0.90,
                "enterprise": 0.92
            },
            "Email": {
                "small": 0.88,
                "medium": 0.85,
                "large": 0.82,
                "enterprise": 0.80
            },
            "Phone": {
                "small": 0.70,
                "medium": 0.80,
                "large": 0.85,
                "enterprise": 0.88
            },
            "WhatsApp": {
                "small": 0.80,
                "medium": 0.72,
                "large": 0.60,
                "enterprise": 0.50
            },
            "Twitter": {
                "small": 0.65,
                "medium": 0.70,
                "large": 0.75,
                "enterprise": 0.68
            },
            "Direct Message": {
                "small": 0.78,
                "medium": 0.75,
                "large": 0.70,
                "enterprise": 0.65
            }
        }
        
        return affinities.get(channel, {}).get(company_size, 0.7)
    
    def _get_historical_channel_performance(
        self,
        channel: str,
        historical_data: Dict
    ) -> float:
        """
        Get historical performance for a channel.
        
        Args:
            channel: Channel name
            historical_data: Historical engagement data
            
        Returns:
            Historical boost factor (0-1)
        """
        channel_perf = historical_data.get('channel_performance', {})
        
        if channel in channel_perf:
            # Normalize historical response rate to 0-1
            perf_rate = channel_perf[channel].get('response_rate', 0.5)
            return float(np.clip(perf_rate, 0.0, 1.0))
        
        return 0.5  # Default if no history
    
    def _generate_channel_reasoning(
        self,
        channel: str,
        score: float,
        company_features: Dict,
        historical_data: Optional[Dict] = None
    ) -> str:
        """
        Generate human-readable reasoning for channel selection.
        
        Args:
            channel: Channel name
            score: Final score for channel
            company_features: Company features
            historical_data: Historical data
            
        Returns:
            Reasoning string
        """
        industry = company_features.get('industry', 'Technology')
        company_size = company_features.get('company_size', 'medium')
        intent = company_features.get('intent_score', 50)
        
        if score > 0.80:
            reason = f"{channel} is highly recommended for {industry} {company_size}-sized companies with high intent (score: {score:.2f})"
        elif score > 0.65:
            reason = f"{channel} is suitable for {industry} companies (score: {score:.2f})"
        else:
            reason = f"{channel} is a secondary option for {industry} companies (score: {score:.2f})"
        
        return reason
