"""
Probability Engine - Feature Engineering and Probability Computation

This module handles feature engineering for each outreach step and
computes dynamic response probabilities with decay modeling.
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class ProbabilityEngine:
    """Computes dynamic response probabilities for outreach sequences."""
    
    def __init__(self):
        """Initialize the probability engine."""
        self.channel_encoding = {
            "linkedin": 0.8,
            "linkedin_followup": 0.6,
            "email": 0.7,
            "email_followup": 0.5,
            "phone": 0.9,
            "whatsapp": 0.75
        }
    
    def compute_step_features(
        self,
        company_features: Dict,
        step_number: int,
        channel: str,
        historical_data: Optional[Dict] = None
    ) -> np.ndarray:
        """
        Compute feature vector for a specific outreach step.
        
        Args:
            company_features: Dictionary containing company-level features
            step_number: The step number in the sequence (1-indexed)
            channel: The channel for this step (e.g., "linkedin", "email")
            historical_data: Optional historical engagement data
            
        Returns:
            Feature vector as numpy array
        """
        # Extract company features
        intent_score = self._normalize_score(
            company_features.get('intent_score', 50)
        )
        signal_strength = self._normalize_score(
            company_features.get('signal_strength', 50)
        )
        engagement_score = self._normalize_score(
            company_features.get('engagement_score', 50)
        )
        
        # Encode channel type
        channel_normalized = channel.lower().replace(" ", "_")
        channel_type = self.channel_encoding.get(channel_normalized, 0.5)
        
        # Step number (normalized)
        step_normalized = 1.0 / step_number
        
        # Time since last contact (if available)
        time_since_last = self._compute_time_decay(
            historical_data.get('last_contact_time') if historical_data else None
        )
        
        # Historical response rate
        historical_response_rate = self._get_historical_response_rate(
            historical_data
        )
        
        # Sequence position (relative position in sequence)
        max_steps = company_features.get('max_outreach_steps', 5)
        sequence_position = 1.0 - (step_number - 1) / max_steps
        
        # Construct feature vector
        features = np.array([
            intent_score,
            signal_strength,
            engagement_score,
            channel_type,
            step_normalized,
            time_since_last,
            historical_response_rate,
            sequence_position
        ])
        
        return features
    
    def apply_decay_model(
        self,
        base_probability: float,
        step_number: int,
        company_features: Dict,
        historical_data: Optional[Dict] = None
    ) -> float:
        """
        Apply exponential decay model to adjust probability.
        
        Formula: adjusted_prob = base_prob * exp(-decay_factor * step_number)
        
        Args:
            base_probability: The base probability from ML model
            step_number: The step number in the sequence
            company_features: Company features
            historical_data: Historical engagement data
            
        Returns:
            Adjusted probability after decay
        """
        # Compute dynamic decay factor
        decay_factor = self._compute_decay_factor(
            company_features,
            historical_data
        )
        
        # Apply exponential decay
        decay_multiplier = np.exp(-decay_factor * (step_number - 1))
        
        adjusted_probability = base_probability * decay_multiplier
        
        # Ensure minimum probability (fatigue floor)
        min_probability = 0.01
        adjusted_probability = max(adjusted_probability, min_probability)
        
        return float(adjusted_probability)
    
    def _compute_decay_factor(
        self,
        company_features: Dict,
        historical_data: Optional[Dict]
    ) -> float:
        """
        Compute dynamic decay factor based on engagement and history.
        
        Higher engagement = lower decay (slower probability drop)
        Lower engagement = higher decay (faster probability drop)
        """
        # Base decay rate
        base_decay = 0.3
        
        # Adjust based on engagement score
        engagement_score = company_features.get('engagement_score', 50) / 100.0
        engagement_adjustment = -0.2 * engagement_score  # Higher engagement = lower decay
        
        # Adjust based on historical response rate
        if historical_data and 'response_rate' in historical_data:
            response_rate = historical_data['response_rate']
            response_adjustment = -0.15 * response_rate
        else:
            response_adjustment = 0
        
        # Adjust based on intent score
        intent_score = company_features.get('intent_score', 50) / 100.0
        intent_adjustment = -0.1 * intent_score
        
        # Compute final decay factor
        decay_factor = base_decay + engagement_adjustment + response_adjustment + intent_adjustment
        
        # Ensure decay factor is positive and reasonable
        decay_factor = max(0.05, min(0.8, decay_factor))
        
        return decay_factor
    
    def _normalize_score(self, score: float, max_score: float = 100.0) -> float:
        """Normalize a score to [0, 1] range."""
        return float(np.clip(score / max_score, 0.0, 1.0))
    
    def _compute_time_decay(self, last_contact_time: Optional[str]) -> float:
        """
        Compute time decay factor based on time since last contact.
        
        Returns value between 0 and 1:
        - 1.0 if no previous contact or long time ago (fresh)
        - Lower values for recent contacts (contact fatigue)
        """
        if last_contact_time is None:
            return 1.0
        
        try:
            last_contact = datetime.fromisoformat(last_contact_time.replace('Z', '+00:00'))
            now = datetime.now(last_contact.tzinfo)
            days_since = (now - last_contact).days
            
            # Optimal re-contact is around 3-7 days
            # Too soon = fatigue, too late = lost interest
            if days_since < 1:
                return 0.3  # Too soon
            elif days_since <= 3:
                return 0.7
            elif days_since <= 7:
                return 1.0  # Optimal window
            elif days_since <= 14:
                return 0.8
            else:
                return 0.6  # Interest may have waned
                
        except Exception as e:
            logger.warning(f"Error parsing last contact time: {e}")
            return 1.0
    
    def _get_historical_response_rate(
        self,
        historical_data: Optional[Dict]
    ) -> float:
        """
        Get historical response rate for similar companies/channels.
        
        Returns normalized response rate (0 to 1).
        """
        if historical_data is None:
            return 0.25  # Default baseline
        
        response_rate = historical_data.get('response_rate', 0.25)
        return float(np.clip(response_rate, 0.0, 1.0))
    
    def compute_channel_effectiveness(
        self,
        channel: str,
        company_features: Dict
    ) -> float:
        """
        Compute effectiveness multiplier for a specific channel.
        
        Different channels work better for different company profiles.
        """
        channel_normalized = channel.lower().replace(" ", "_")
        
        # Industry-specific channel preferences
        industry = company_features.get('industry', '').lower()
        
        effectiveness = 1.0
        
        # Tech companies respond better to LinkedIn
        if 'tech' in industry or 'software' in industry:
            if 'linkedin' in channel_normalized:
                effectiveness *= 1.2
        
        # Enterprise companies respond better to email
        company_size = company_features.get('company_size', 'medium')
        if company_size == 'large' or company_size == 'enterprise':
            if 'email' in channel_normalized:
                effectiveness *= 1.15
        
        # High intent companies respond better to phone
        intent_score = company_features.get('intent_score', 50)
        if intent_score > 80 and channel_normalized == 'phone':
            effectiveness *= 1.3
        
        return effectiveness
