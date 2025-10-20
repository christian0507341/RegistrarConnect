# AI Configuration for enhanced chatbot
import os
from typing import Dict, List

class AIConfig:
    """Configuration settings for the enhanced AI system"""
    
    # Model settings
    MODEL_SETTINGS = {
        'base_model': 'distilbert-base-uncased',
        'max_sequence_length': 128,
        'confidence_threshold': 0.7,
        'fallback_confidence': 0.3
    }
    
    # Response settings
    RESPONSE_SETTINGS = {
        'max_response_length': 500,
        'include_suggestions': True,
        'include_confidence_scores': True,
        'personalize_responses': True
    }
    
    # Context settings
    CONTEXT_SETTINGS = {
        'max_context_history': 10,
        'context_timeout_minutes': 30,
        'enable_user_preferences': True,
        'enable_conversation_memory': True
    }
    
    # Classification settings
    CLASSIFICATION_SETTINGS = {
        'enable_fuzzy_matching': True,
        'enable_entity_extraction': True,
        'enable_context_analysis': True,
        'min_confidence_for_auto_classification': 0.8
    }
    
    # Performance settings
    PERFORMANCE_SETTINGS = {
        'cache_responses': True,
        'cache_duration_minutes': 60,
        'enable_parallel_processing': False,  # Set to True for production
        'max_concurrent_requests': 10
    }
    
    # Debug settings
    DEBUG_SETTINGS = {
        'enable_debug_logging': os.getenv('AI_DEBUG', 'false').lower() == 'true',
        'log_classification_details': True,
        'log_response_generation': True,
        'log_performance_metrics': True
    }
    
    @classmethod
    def get_setting(cls, category: str, key: str, default=None):
        """Get a specific setting value"""
        settings_dict = getattr(cls, f"{category.upper()}_SETTINGS", {})
        return settings_dict.get(key, default)
    
    @classmethod
    def update_setting(cls, category: str, key: str, value):
        """Update a specific setting value"""
        settings_dict = getattr(cls, f"{category.upper()}_SETTINGS", {})
        settings_dict[key] = value
    
    @classmethod
    def get_all_settings(cls) -> Dict:
        """Get all configuration settings"""
        return {
            'model': cls.MODEL_SETTINGS,
            'response': cls.RESPONSE_SETTINGS,
            'context': cls.CONTEXT_SETTINGS,
            'classification': cls.CLASSIFICATION_SETTINGS,
            'performance': cls.PERFORMANCE_SETTINGS,
            'debug': cls.DEBUG_SETTINGS
        }
