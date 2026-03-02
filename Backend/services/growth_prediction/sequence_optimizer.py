"""
Sequence Optimizer - Optimal Stopping Point Detection

This module implements the optimal stopping algorithm using
marginal utility analysis to determine when to stop outreach.
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class SequenceOptimizer:
    """Determines optimal stopping point in outreach sequences."""
    
    def __init__(self):
        """Initialize the sequence optimizer."""
        self.default_stopping_threshold = 0.05  # 5% marginal gain minimum
    
    def find_optimal_stopping_point(
        self,
        step_probabilities: List[float],
        company_features: Dict,
        historical_data: Optional[Dict] = None
    ) -> Dict:
        """
        Find the optimal stopping point in the outreach sequence.
        
        Uses marginal utility analysis:
        - Computes marginal gain at each step
        - Stops when marginal gain drops below threshold
        
        Args:
            step_probabilities: List of probabilities for each step
            company_features: Company features for dynamic threshold
            historical_data: Historical data for calibration
            
        Returns:
            Dictionary with optimal stopping point and analysis
        """
        if not step_probabilities or len(step_probabilities) == 0:
            return {
                "optimal_step": 1,
                "reason": "No probabilities provided",
                "marginal_gains": [],
                "stopping_threshold": self.default_stopping_threshold
            }
        
        # Compute dynamic stopping threshold
        stopping_threshold = self._compute_stopping_threshold(
            company_features,
            historical_data
        )
        
        # Compute marginal gains
        marginal_gains = self._compute_marginal_gains(step_probabilities)
        
        # Find optimal stopping point
        optimal_step = self._find_stopping_point(
            marginal_gains,
            stopping_threshold,
            step_probabilities
        )
        
        # Generate explanation
        reason = self._generate_explanation(
            optimal_step,
            marginal_gains,
            stopping_threshold,
            step_probabilities
        )
        
        # Calculate cumulative probability using complementary probability formula
        # P(at least one response) = 1 - P(no response at all steps)
        # = 1 - ∏(1 - p_i)
        cumulative_prob = 1.0
        for p in step_probabilities[:optimal_step]:
            cumulative_prob *= (1 - p)
        total_expected_probability = 1.0 - cumulative_prob
        
        return {
            "optimal_step": optimal_step,
            "reason": reason,
            "marginal_gains": marginal_gains,
            "stopping_threshold": stopping_threshold,
            "total_expected_probability": round(total_expected_probability, 4),
            "roi_score": self._compute_roi_score(
                step_probabilities[:optimal_step],
                optimal_step
            )
        }
    
    def _compute_marginal_gains(self, step_probabilities: List[float]) -> List[float]:
        """
        Compute marginal gain at each step.
        
        Marginal gain = probability(step_n) - probability(step_n+1)
        
        Returns list of gains (length = len(probabilities) - 1)
        """
        marginal_gains = []
        
        for i in range(len(step_probabilities) - 1):
            gain = step_probabilities[i] - step_probabilities[i + 1]
            marginal_gains.append(gain)
        
        # For the last step, use a special calculation
        if len(step_probabilities) > 0:
            last_gain = step_probabilities[-1] * 0.5  # Diminishing returns
            marginal_gains.append(last_gain)
        
        return marginal_gains
    
    def _compute_stopping_threshold(
        self,
        company_features: Dict,
        historical_data: Optional[Dict]
    ) -> float:
        """
        Compute dynamic stopping threshold based on company profile.
        
        High-value companies: Lower threshold (more persistence)
        Low-value companies: Higher threshold (stop earlier)
        """
        base_threshold = self.default_stopping_threshold
        
        # Adjust based on intent score
        intent_score = company_features.get('intent_score', 50) / 100.0
        intent_adjustment = -0.02 * intent_score  # Higher intent = lower threshold
        
        # Adjust based on engagement score
        engagement_score = company_features.get('engagement_score', 50) / 100.0
        engagement_adjustment = -0.015 * engagement_score
        
        # Adjust based on company value/size
        company_size = company_features.get('company_size', 'medium')
        size_adjustment = {
            'small': 0.01,      # Stop earlier for small companies
            'medium': 0.0,
            'large': -0.01,     # More persistence for large companies
            'enterprise': -0.02
        }.get(company_size, 0.0)
        
        # Adjust based on historical success rate
        if historical_data and 'response_rate' in historical_data:
            response_rate = historical_data['response_rate']
            history_adjustment = -0.01 * response_rate  # Better history = lower threshold
        else:
            history_adjustment = 0
        
        # Compute final threshold
        threshold = (
            base_threshold +
            intent_adjustment +
            engagement_adjustment +
            size_adjustment +
            history_adjustment
        )
        
        # Ensure threshold is in reasonable range
        threshold = max(0.01, min(0.15, threshold))
        
        return float(threshold)
    
    def _find_stopping_point(
        self,
        marginal_gains: List[float],
        threshold: float,
        step_probabilities: List[float]
    ) -> int:
        """
        Find the step where we should stop outreach.
        
        Returns 1-indexed step number.
        """
        # Find first step where marginal gain drops below threshold
        for i, gain in enumerate(marginal_gains):
            if gain < threshold:
                # Stop at step i+1 (before the low-gain step)
                return i + 1
        
        # If all gains are above threshold, use the full sequence
        # But cap at a reasonable maximum to avoid diminishing returns
        max_steps = 5
        optimal_step = min(len(step_probabilities), max_steps)
        
        # Additional check: stop if probability gets too low
        min_probability = 0.05  # 5%
        for i, prob in enumerate(step_probabilities):
            if prob < min_probability:
                return max(1, i)  # Stop before this low-probability step
        
        return optimal_step
    
    def _generate_explanation(
        self,
        optimal_step: int,
        marginal_gains: List[float],
        threshold: float,
        step_probabilities: List[float]
    ) -> str:
        """Generate human-readable explanation for the stopping point."""
        if optimal_step >= len(step_probabilities):
            return (
                f"Continue through all {len(step_probabilities)} steps. "
                f"Marginal gains remain above threshold ({threshold:.1%})."
            )
        
        if optimal_step == 1:
            if len(step_probabilities) > 1:
                gain = marginal_gains[0] if len(marginal_gains) > 0 else 0
                return (
                    f"Stop after first attempt. "
                    f"Marginal gain to step 2 ({gain:.1%}) is below threshold ({threshold:.1%})."
                )
            else:
                return "Only one step in sequence."
        
        prev_gain = marginal_gains[optimal_step - 2] if optimal_step > 1 else 0
        current_gain = marginal_gains[optimal_step - 1] if len(marginal_gains) >= optimal_step else 0
        
        return (
            f"Optimal stopping point at step {optimal_step}. "
            f"Marginal gain drops from {prev_gain:.1%} to {current_gain:.1%}, "
            f"below threshold of {threshold:.1%}. "
            f"Expected cumulative probability: {sum(step_probabilities[:optimal_step]):.1%}."
        )
    
    def _compute_roi_score(
        self,
        probabilities: List[float],
        num_steps: int
    ) -> float:
        """
        Compute ROI score for the sequence.
        
        ROI = Total Expected Probability / Number of Steps
        Higher ROI = better efficiency
        """
        if num_steps == 0:
            return 0.0
        
        total_probability = sum(probabilities)
        roi = total_probability / num_steps
        
        return float(roi)
    
    def analyze_sequence_efficiency(
        self,
        step_probabilities: List[float],
        step_costs: Optional[List[float]] = None
    ) -> Dict:
        """
        Analyze the efficiency of the entire sequence.
        
        Args:
            step_probabilities: Probability at each step
            step_costs: Optional cost for each step (time, money, etc.)
            
        Returns:
            Dictionary with efficiency metrics
        """
        if not step_probabilities:
            return {}
        
        # Default costs if not provided (relative effort)
        if step_costs is None:
            step_costs = [1.0] * len(step_probabilities)
        
        # Cumulative metrics
        cumulative_prob = []
        cumulative_cost = []
        efficiency_ratio = []
        
        cum_prob = 0
        cum_cost = 0
        
        for prob, cost in zip(step_probabilities, step_costs):
            cum_prob += prob
            cum_cost += cost
            cumulative_prob.append(cum_prob)
            cumulative_cost.append(cum_cost)
            
            # Efficiency = probability gained per unit cost
            efficiency = cum_prob / cum_cost if cum_cost > 0 else 0
            efficiency_ratio.append(efficiency)
        
        # Find most efficient point
        max_efficiency_step = np.argmax(efficiency_ratio) + 1
        
        return {
            "cumulative_probability": cumulative_prob,
            "cumulative_cost": cumulative_cost,
            "efficiency_ratio": efficiency_ratio,
            "most_efficient_step": max_efficiency_step,
            "max_efficiency": max(efficiency_ratio) if efficiency_ratio else 0
        }
