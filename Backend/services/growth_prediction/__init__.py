"""
Growth Prediction Module

This module provides dynamic growth curve prediction and optimal stopping
point detection for outreach sequences using machine learning and probabilistic modeling.

New Features:
- Dynamic channel prediction (top 2 channels)
- Sequence building from channels
- Priority weighting based on channel scores
"""

from .growth_pipeline import get_growth_pipeline, GrowthPipeline
from .growth_model import get_model_manager, GrowthModelManager
from .probability_engine import ProbabilityEngine
from .sequence_optimizer import SequenceOptimizer
from .sequence_builder import SequenceBuilder
from .priority_weighting import PriorityWeightingEngine
from .channel_predictor import ChannelPredictor

# Singleton instances
_channel_predictor = None
_sequence_builder = None
_priority_weighting_engine = None


def get_channel_predictor() -> ChannelPredictor:
    """Get or create singleton ChannelPredictor instance."""
    global _channel_predictor
    if _channel_predictor is None:
        _channel_predictor = ChannelPredictor()
    return _channel_predictor


def get_sequence_builder() -> SequenceBuilder:
    """Get or create singleton SequenceBuilder instance."""
    global _sequence_builder
    if _sequence_builder is None:
        _sequence_builder = SequenceBuilder()
    return _sequence_builder


def get_priority_weighting_engine() -> PriorityWeightingEngine:
    """Get or create singleton PriorityWeightingEngine instance."""
    global _priority_weighting_engine
    if _priority_weighting_engine is None:
        _priority_weighting_engine = PriorityWeightingEngine()
    return _priority_weighting_engine


__all__ = [
    'get_growth_pipeline',
    'GrowthPipeline',
    'get_model_manager',
    'GrowthModelManager',
    'ProbabilityEngine',
    'SequenceOptimizer',
    'SequenceBuilder',
    'PriorityWeightingEngine',
    'ChannelPredictor',
    'get_channel_predictor',
    'get_sequence_builder',
    'get_priority_weighting_engine'
]
