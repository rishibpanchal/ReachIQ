"""
Growth Pipeline - End-to-End Orchestrator

This module orchestrates the complete growth curve prediction pipeline,
from fetching company data to computing optimal stopping points.

Enhanced with dynamic channel prediction, sequence building, and priority weighting.
"""

import logging
from typing import Dict, List, Optional
import numpy as np

from .growth_model import get_model_manager
from .probability_engine import ProbabilityEngine
from .sequence_optimizer import SequenceOptimizer
from .channel_predictor import ChannelPredictor
from .sequence_builder import SequenceBuilder
from .priority_weighting import PriorityWeightingEngine

logger = logging.getLogger(__name__)


class GrowthPipeline:
    """Orchestrates the complete growth curve prediction process."""
    
    def __init__(self):
        """Initialize the growth pipeline with all components."""
        self.model_manager = get_model_manager()
        self.probability_engine = ProbabilityEngine()
        self.sequence_optimizer = SequenceOptimizer()
        self.channel_predictor = ChannelPredictor()
        self.sequence_builder = SequenceBuilder()
        self.priority_weighting_engine = PriorityWeightingEngine()
    
    def predict_top_channels(
        self,
        company_id: str,
        company_features: Dict,
        historical_data: Optional[Dict] = None,
        num_channels: int = 2
    ) -> List[Dict]:
        """
        Predict top N outreach channels for a company.
        
        Args:
            company_id: Unique company identifier
            company_features: Dictionary of company-level features
            historical_data: Optional historical engagement data
            num_channels: Number of top channels to return
            
        Returns:
            List of top channels with scores
        """
        logger.info(f"Predicting top {num_channels} channels for company {company_id}")
        
        top_channels = self.channel_predictor.predict_top_channels(
            company_features,
            historical_data,
            num_channels
        )
        
        return top_channels
    
    def predict_growth_curve(
        self,
        company_id: str,
        company_features: Dict,
        outreach_sequence: Optional[List[Dict]] = None,
        historical_data: Optional[Dict] = None,
        use_dynamic_channels: bool = True
    ) -> Dict:
        """
        Predict complete growth curve for a company's outreach sequence.
        
        If outreach_sequence is not provided, it will be dynamically built from
        the top 2 predicted channels.
        
        Args:
            company_id: Unique company identifier
            company_features: Dictionary of company-level features
            outreach_sequence: List of outreach steps. If None, will be dynamically generated.
            historical_data: Optional historical engagement data
            use_dynamic_channels: If True and outreach_sequence is None, build sequence from top channels
            
        Returns:
            Complete growth curve prediction with optimal stopping point
        """
        logger.info(f"Starting growth curve prediction for company {company_id}")
        
        try:
            # Step 1: Predict top channels and build sequence if not provided
            if outreach_sequence is None and use_dynamic_channels:
                logger.info(f"Building dynamic sequence for {company_id}")
                top_channels = self.predict_top_channels(
                    company_id,
                    company_features,
                    historical_data,
                    num_channels=2
                )
                outreach_sequence = self.sequence_builder.build_sequence(top_channels)
                logger.info(f"Dynamic sequence built: {[s['display_name'] for s in outreach_sequence]}")
            elif outreach_sequence is None:
                # Fallback to default sequence if dynamic channels disabled
                outreach_sequence = [
                    {"step": 1, "channel": "LinkedIn", "type": "initial"},
                    {"step": 2, "channel": "LinkedIn", "type": "followup"},
                    {"step": 3, "channel": "Email", "type": "initial"},
                    {"step": 4, "channel": "Email", "type": "followup"}
                ]
            
            # Step 2: Compute base probabilities for each step
            step_predictions = self._compute_step_probabilities(
                company_features,
                outreach_sequence,
                historical_data
            )
            
            # Step 3: Apply priority weighting based on channel scores
            if use_dynamic_channels and any('channel_score' in step for step in outreach_sequence):
                logger.info("Applying priority weighting to probabilities")
                base_probs = [step['base_probability'] for step in step_predictions]
                weighted_sequence = self.priority_weighting_engine.apply_weights_to_sequence(
                    base_probs,
                    outreach_sequence
                )
                
                # Merge weighted probabilities back into step predictions
                for i, weighted_step in enumerate(weighted_sequence):
                    step_predictions[i]['probability'] = weighted_step['priority_adjusted_probability']
                    step_predictions[i]['channel_score'] = weighted_step.get('channel_score', 0.5)
                    step_predictions[i]['channel_weight'] = weighted_step.get('channel_weight', 1.0)
                    step_predictions[i]['is_primary_channel'] = weighted_step.get('is_primary', True)
            
            # Step 4: Extract probabilities for optimization
            probabilities = [step['probability'] for step in step_predictions]
            
            # Step 5: Find optimal stopping point
            optimization_result = self.sequence_optimizer.find_optimal_stopping_point(
                probabilities,
                company_features,
                historical_data
            )
            
            # Step 6: Compute additional metrics
            metrics = self._compute_additional_metrics(
                step_predictions,
                optimization_result
            )
            
            # Step 7: Construct response
            result = {
                "company_id": company_id,
                "steps": step_predictions,
                "optimal_stopping_point": optimization_result['optimal_step'],
                "stopping_reason": optimization_result['reason'],
                "expected_total_response_probability": optimization_result['total_expected_probability'],
                "roi_score": optimization_result['roi_score'],
                "marginal_gains": optimization_result['marginal_gains'],
                "stopping_threshold": optimization_result['stopping_threshold'],
                "metrics": metrics,
                "model_info": self.model_manager.get_model_info(),
                "dynamic_sequence_used": use_dynamic_channels and outreach_sequence is not None
            }
            
            logger.info(f"Growth curve prediction completed for company {company_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error in growth curve prediction: {e}", exc_info=True)
            return self._create_error_response(company_id, str(e))
    
    def _compute_step_probabilities(
        self,
        company_features: Dict,
        outreach_sequence: List[Dict],
        historical_data: Optional[Dict]
    ) -> List[Dict]:
        """
        Compute probability for each step in the sequence.
        
        Returns list of step predictions with probability and metadata.
        """
        step_predictions = []
        
        for i, step_info in enumerate(outreach_sequence):
            step_number = i + 1
            channel = step_info.get('channel', 'email')
            
            # Compute features for this step
            features = self.probability_engine.compute_step_features(
                company_features,
                step_number,
                channel,
                historical_data
            )
            
            # Get base probability from ML model
            base_probability = self.model_manager.predict_response_probability(features)
            
            # Apply decay model
            adjusted_probability = self.probability_engine.apply_decay_model(
                base_probability,
                step_number,
                company_features,
                historical_data
            )
            
            # Apply channel effectiveness
            channel_effectiveness = self.probability_engine.compute_channel_effectiveness(
                channel,
                company_features
            )
            
            final_probability = adjusted_probability * channel_effectiveness
            final_probability = float(np.clip(final_probability, 0.0, 1.0))
            
            # Create step prediction
            step_prediction = {
                "step": step_number,
                "channel": channel,
                "probability": round(final_probability, 4),
                "base_probability": round(base_probability, 4),
                "decay_adjusted": round(adjusted_probability, 4),
                "channel_effectiveness": round(channel_effectiveness, 4),
                "features": features.tolist()
            }
            
            step_predictions.append(step_prediction)
        
        return step_predictions
    
    def _compute_additional_metrics(
        self,
        step_predictions: List[Dict],
        optimization_result: Dict
    ) -> Dict:
        """Compute additional analytics metrics."""
        if not step_predictions:
            return {}
        
        probabilities = [step['probability'] for step in step_predictions]
        optimal_step = optimization_result['optimal_step']
        
        # Compute cumulative probability curve (probability of at least one response by step n)
        # Using complementary probability: P(≥1 success) = 1 - P(no success)
        cumulative_probability = []
        no_response_prob = 1.0
        for prob in probabilities:
            no_response_prob *= (1 - prob)
            cumulative_prob = 1.0 - no_response_prob
            cumulative_probability.append(round(cumulative_prob, 4))
        
        # Compute probability at optimal point
        optimal_probability = cumulative_probability[optimal_step - 1] if optimal_step <= len(cumulative_probability) else cumulative_probability[-1]
        
        # Compute diminishing returns rate
        diminishing_rate = self._compute_diminishing_rate(probabilities)
        
        # Compute wasted effort if continuing past optimal
        wasted_effort = 0
        if optimal_step < len(probabilities):
            wasted_effort = sum(probabilities[optimal_step:]) / sum(probabilities[:optimal_step]) if sum(probabilities[:optimal_step]) > 0 else 0
        
        return {
            "cumulative_probability": cumulative_probability,
            "optimal_probability": optimal_probability,
            "diminishing_returns_rate": round(diminishing_rate, 4),
            "wasted_effort_ratio": round(wasted_effort, 4),
            "efficiency_score": round(optimal_probability / optimal_step, 4),
            "total_steps": len(step_predictions),
            "steps_saved": max(0, len(step_predictions) - optimal_step)
        }
    
    def _compute_diminishing_rate(self, probabilities: List[float]) -> float:
        """
        Compute the rate of diminishing returns.
        
        Uses the ratio of last probability to first probability.
        Lower ratio = faster diminishing returns.
        """
        if len(probabilities) < 2:
            return 1.0
        
        first_prob = probabilities[0]
        last_prob = probabilities[-1]
        
        if first_prob == 0:
            return 0.0
        
        return last_prob / first_prob
    
    def _create_error_response(self, company_id: str, error_message: str) -> Dict:
        """Create an error response with fallback values."""
        return {
            "company_id": company_id,
            "steps": [],
            "optimal_stopping_point": 1,
            "stopping_reason": f"Error: {error_message}",
            "expected_total_response_probability": 0.0,
            "roi_score": 0.0,
            "marginal_gains": [],
            "stopping_threshold": 0.05,
            "metrics": {},
            "error": error_message
        }
    
    def batch_predict(
        self,
        companies: List[Dict],
        outreach_sequence: List[Dict]
    ) -> List[Dict]:
        """
        Predict growth curves for multiple companies in batch.
        
        Args:
            companies: List of company feature dictionaries
            outreach_sequence: Standard outreach sequence to apply to all
            
        Returns:
            List of growth curve predictions
        """
        results = []
        
        for company in companies:
            company_id = company.get('id', 'unknown')
            
            try:
                result = self.predict_growth_curve(
                    company_id,
                    company,
                    outreach_sequence,
                    historical_data=None
                )
                results.append(result)
            except Exception as e:
                logger.error(f"Error predicting for company {company_id}: {e}")
                results.append(self._create_error_response(company_id, str(e)))
        
        return results


# Singleton instance
_pipeline = None


def get_growth_pipeline() -> GrowthPipeline:
    """Get the singleton growth pipeline instance."""
    global _pipeline
    if _pipeline is None:
        _pipeline = GrowthPipeline()
    return _pipeline
