"""
Sequence Builder - Dynamic Outreach Sequence Generator

This module builds the 4-stage outreach sequence dynamically from
the Top 2 Outreach Channels predicted by the ML model.

Instead of hardcoded channels, the sequence is derived from:
- Primary Channel: Top channel with highest priority score
- Secondary Channel: Second-best channel with secondary score

Stages:
1. Primary Channel Initial Contact
2. Primary Channel Follow-up
3. Secondary Channel Initial Contact
4. Secondary Channel Follow-up
"""

from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class SequenceBuilder:
    """Builds dynamic outreach sequences from top channels."""
    
    def __init__(self):
        """Initialize the sequence builder."""
        self.stage_templates = {
            "initial": "Initial Contact",
            "followup": "Follow-up"
        }
    
    def build_sequence(self, top_channels: List[Dict]) -> List[Dict]:
        """
        Build 4-stage outreach sequence from top 2 channels.
        
        Args:
            top_channels: List of channels with scores, e.g.:
                [
                    {"name": "LinkedIn", "score": 0.82},
                    {"name": "Email", "score": 0.61}
                ]
        
        Returns:
            4-stage sequence structure:
            [
                {
                    "step": 1,
                    "channel": "LinkedIn",
                    "channel_score": 0.82,
                    "type": "initial",
                    "display_name": "LinkedIn Initial Contact"
                },
                ...
            ]
        
        Raises:
            ValueError: If fewer than 2 channels provided
        """
        if not top_channels or len(top_channels) < 2:
            logger.error(f"Invalid top_channels: expected at least 2, got {len(top_channels) if top_channels else 0}")
            raise ValueError(
                "Sequence builder requires at least 2 top channels. "
                f"Got: {len(top_channels) if top_channels else 0}"
            )
        
        primary_channel = top_channels[0]
        secondary_channel = top_channels[1]
        
        logger.info(
            f"Building sequence with Primary={primary_channel['name']} ({primary_channel['score']:.2f}), "
            f"Secondary={secondary_channel['name']} ({secondary_channel['score']:.2f})"
        )
        
        sequence = [
            # Stage 1: Primary Channel Initial Contact
            {
                "step": 1,
                "channel": primary_channel["name"],
                "channel_score": primary_channel["score"],
                "type": "initial",
                "display_name": f"{primary_channel['name']} Initial",
                "is_primary": True
            },
            # Stage 2: Primary Channel Follow-up
            {
                "step": 2,
                "channel": primary_channel["name"],
                "channel_score": primary_channel["score"],
                "type": "followup",
                "display_name": f"{primary_channel['name']} Follow-up",
                "is_primary": True
            },
            # Stage 3: Secondary Channel Initial Contact
            {
                "step": 3,
                "channel": secondary_channel["name"],
                "channel_score": secondary_channel["score"],
                "type": "initial",
                "display_name": f"{secondary_channel['name']} Initial",
                "is_primary": False
            },
            # Stage 4: Secondary Channel Follow-up
            {
                "step": 4,
                "channel": secondary_channel["name"],
                "channel_score": secondary_channel["score"],
                "type": "followup",
                "display_name": f"{secondary_channel['name']} Follow-up",
                "is_primary": False
            }
        ]
        
        logger.info(f"Sequence built successfully with {len(sequence)} stages")
        return sequence
    
    def validate_sequence(self, sequence: List[Dict]) -> bool:
        """
        Validate that sequence follows the expected structure.
        
        Args:
            sequence: Sequence to validate
            
        Returns:
            True if valid, raises exception otherwise
        """
        if not sequence or len(sequence) != 4:
            raise ValueError(f"Sequence must have exactly 4 stages, got {len(sequence)}")
        
        required_fields = ["step", "channel", "channel_score", "type", "display_name", "is_primary"]
        
        for i, stage in enumerate(sequence):
            for field in required_fields:
                if field not in stage:
                    raise ValueError(
                        f"Stage {i+1} missing required field: {field}. "
                        f"Got: {stage.keys()}"
                    )
            
            # Validate step number
            if stage["step"] != i + 1:
                raise ValueError(
                    f"Stage {i+1} has incorrect step number: {stage['step']}"
                )
        
        logger.info("Sequence validation passed")
        return True
    
    def get_sequence_with_metadata(
        self,
        top_channels: List[Dict],
        buyer_data: Optional[Dict] = None
    ) -> Dict:
        """
        Get the sequence with additional metadata.
        
        Args:
            top_channels: Top channels from ML model
            buyer_data: Optional buyer context data
            
        Returns:
            Sequence with metadata
        """
        sequence = self.build_sequence(top_channels)
        
        return {
            "sequence": sequence,
            "metadata": {
                "primary_channel": top_channels[0]["name"],
                "primary_score": top_channels[0]["score"],
                "secondary_channel": top_channels[1]["name"],
                "secondary_score": top_channels[1]["score"],
                "total_stages": len(sequence),
                "buyer_context": buyer_data or {}
            }
        }
