"""
Growth Prediction Module

This module provides dynamic growth curve prediction and optimal stopping
point detection for outreach sequences using machine learning and probabilistic modeling.
"""

from .growth_pipeline import get_growth_pipeline, GrowthPipeline
from .growth_model import get_model_manager, GrowthModelManager
from .probability_engine import ProbabilityEngine
from .sequence_optimizer import SequenceOptimizer

__all__ = [
    'get_growth_pipeline',
    'GrowthPipeline',
    'get_model_manager',
    'GrowthModelManager',
    'ProbabilityEngine',
    'SequenceOptimizer'
]
