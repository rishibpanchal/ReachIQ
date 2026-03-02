"""
Priority Weighting Engine - Channel Priority-Based Probability Adjustment

This module applies priority weighting to probabilities based on
channel priority scores from the ML model. 

Weight Formula:
- priority_adjusted_probability = base_probability * channel_priority_weight

Follow-up Decay:
- If step is a follow-up, apply additional decay factor (0.7)
- This models the reduced effectiveness of repeated contact
"""

from typing import Dict, List, Optional
import numpy as np
import logging

logger = logging.getLogger(__name__)


class PriorityWeightingEngine:
    """Applies priority-based weighting to outreach probabilities."""
    
    # Decay factors for follow-up contacts
    FOLLOWUP_DECAY_FACTOR = 0.7  # 30% reduction in probability for follow-ups
    
    # Normalization bounds
    MIN_WEIGHT = 0.3
    MAX_WEIGHT = 1.2
    
    def __init__(self):
        """Initialize the priority weighting engine."""
        self.followup_decay = self.FOLLOWUP_DECAY_FACTOR
    
    def apply_channel_priority_weight(
        self,
        base_probability: float,
        channel_score: float,
        step_type: str = "initial"
    ) -> float:
        """
        Apply channel priority weight to base probability.
        
        Formula:
            priority_adjusted_prob = base_prob * channel_priority_weight
            
        If step_type is "followup":
            priority_adjusted_prob *= followup_decay_factor
        
        Args:
            base_probability: Probability from ML model (0-1)
            channel_score: Priority score for channel from top-channels (0-1)
            step_type: "initial" or "followup"
            
        Returns:
            Priority-adjusted probability (0-1)
        """
        if not (0 <= base_probability <= 1):
            logger.warning(f"Base probability out of range: {base_probability}")
            base_probability = np.clip(base_probability, 0, 1)
        
        if not (0 <= channel_score <= 1):
            logger.warning(f"Channel score out of range: {channel_score}")
            channel_score = np.clip(channel_score, 0, 1)
        
        # Normalize channel score to weight range
        # Map [0, 1] to [MIN_WEIGHT, MAX_WEIGHT]
        channel_weight = self._normalize_channel_score(channel_score)
        
        # Apply channel weight
        weighted_probability = base_probability * channel_weight
        
        # Apply follow-up decay if applicable
        if step_type.lower() == "followup":
            weighted_probability *= self.followup_decay
            logger.debug(
                f"Applied follow-up decay: {base_probability:.4f} * {channel_weight:.4f} * "
                f"{self.followup_decay:.4f} = {weighted_probability:.4f}"
            )
        else:
            logger.debug(
                f"Applied channel weight: {base_probability:.4f} * {channel_weight:.4f} = "
                f"{weighted_probability:.4f}"
            )
        
        # Clip to valid probability range
        final_probability = float(np.clip(weighted_probability, 0.0, 1.0))
        
        return final_probability
    
    def _normalize_channel_score(self, score: float) -> float:
        """
        Normalize channel score to weight multiplier.
        
        Maps [0, 1] to [MIN_WEIGHT, MAX_WEIGHT] for probability adjustment.
        
        Args:
            score: Channel priority score (0-1)
            
        Returns:
            Weight multiplier (MIN_WEIGHT to MAX_WEIGHT)
        """
        # Linear interpolation from MIN_WEIGHT to MAX_WEIGHT
        weight = self.MIN_WEIGHT + (score * (self.MAX_WEIGHT - self.MIN_WEIGHT))
        return weight
    
    def apply_weights_to_sequence(
        self,
        base_probabilities: List[float],
        sequence: List[Dict]
    ) -> List[Dict]:
        """
        Apply priority weights to all steps in sequence.
        
        Args:
            base_probabilities: List of base probabilities from ML model
            sequence: Outreach sequence with channel scores and types
            
        Returns:
            Sequence with priority-weighted probabilities
            Example:
            [
                {
                    "step": 1,
                    "channel": "LinkedIn",
                    "base_probability": 0.45,
                    "channel_score": 0.82,
                    "channel_weight": 1.15,
                    "step_type": "initial",
                    "followup_decay": 1.0,
                    "priority_adjusted_probability": 0.52,
                    ...
                },
                ...
            ]
        """
        if len(base_probabilities) != len(sequence):
            raise ValueError(
                f"Probability count ({len(base_probabilities)}) doesn't match "
                f"sequence length ({len(sequence)})"
            )
        
        weighted_sequence = []
        
        for i, (step, base_prob) in enumerate(zip(sequence, base_probabilities)):
            channel_score = step.get("channel_score", 0.5)
            step_type = step.get("type", "initial")
            
            # Compute channel weight
            channel_weight = self._normalize_channel_score(channel_score)
            
            # Apply weights
            priority_adjusted_prob = self.apply_channel_priority_weight(
                base_prob,
                channel_score,
                step_type
            )
            
            # Determine decay applied
            decay_applied = self.followup_decay if step_type.lower() == "followup" else 1.0
            
            # Construct weighted step
            weighted_step = {
                **step,
                "base_probability": round(base_prob, 4),
                "channel_weight": round(channel_weight, 4),
                "step_type": step_type,
                "followup_decay": decay_applied,
                "priority_adjusted_probability": round(priority_adjusted_prob, 4)
            }
            
            weighted_sequence.append(weighted_step)
            
            logger.debug(
                f"Step {i+1} ({step.get('channel')} {step_type}): "
                f"base={base_prob:.4f}, weight={channel_weight:.4f}, "
                f"decay={decay_applied:.4f}, final={priority_adjusted_prob:.4f}"
            )
        
        return weighted_sequence
    
    def compute_cumulative_probability(
        self,
        step_probabilities: List[float]
    ) -> List[float]:
        """
        Compute cumulative response probability using complementary formula.
        
        Formula:
            P(at least one response by step n) = 1 - ∏(1 - p_i) for i=1 to n
        
        This accounts for the probability of getting at least one response
        across multiple independent contact attempts.
        
        Args:
            step_probabilities: List of individual step probabilities
            
        Returns:
            List of cumulative probabilities (one per step)
        """
        cumulative_probs = []
        cumulative_product = 1.0
        
        for prob in step_probabilities:
            # Multiply by (1 - probability) for this step
            cumulative_product *= (1 - prob)
            
            # Cumulative probability of at least one response
            cumulative_prob = 1.0 - cumulative_product
            cumulative_probs.append(round(cumulative_prob, 4))
        
        logger.debug(f"Computed cumulative probabilities: {cumulative_probs}")
        return cumulative_probs
    
    def get_marginal_gains(self, cumulative_probs: List[float]) -> List[float]:
        """
        Compute marginal gain at each step for optimization analysis.
        
        Marginal gain = improvement from previous step
        
        Args:
            cumulative_probs: List of cumulative probabilities
            
        Returns:
            List of marginal gains
        """
        if not cumulative_probs:
            return []
        
        marginal_gains = [cumulative_probs[0]]  # First step gain
        
        for i in range(1, len(cumulative_probs)):
            gain = cumulative_probs[i] - cumulative_probs[i-1]
            marginal_gains.append(round(gain, 4))
        
        logger.debug(f"Computed marginal gains: {marginal_gains}")
        return marginal_gains
    
    def set_followup_decay(self, decay_factor: float) -> None:
        """
        Set custom follow-up decay factor.
        
        Args:
            decay_factor: Decay multiplier (0-1), e.g., 0.7 for 30% reduction
        """
        if not (0 < decay_factor <= 1):
            raise ValueError(
                f"Decay factor must be between 0 (exclusive) and 1 (inclusive). Got {decay_factor}"
            )
        
        self.followup_decay = decay_factor
        logger.info(f"Follow-up decay factor updated to {decay_factor}")
