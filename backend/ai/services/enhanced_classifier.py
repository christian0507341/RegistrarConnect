# Enhanced document classification with better accuracy
import re
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher

class EnhancedDocumentClassifier:
    """Enhanced document type classification with multiple strategies"""
    
    def __init__(self):
        # Enhanced keyword patterns with weights
        self.keyword_patterns = {
            'OTR': {
                'high_confidence': [
                    'official transcript', 'transcript of records', 'academic transcript',
                    'complete transcript', 'full transcript', 'otr'
                ],
                'medium_confidence': [
                    'transcript', 'academic record', 'grade record', 'student record'
                ],
                'low_confidence': [
                    'grades', 'academic', 'record', 'official'
                ]
            },
            'COG': {
                'high_confidence': [
                    'certificate of grades', 'cog', 'grade certificate',
                    'grades certificate', 'academic grades'
                ],
                'medium_confidence': [
                    'grade certificate', 'grades', 'academic grades'
                ],
                'low_confidence': [
                    'certificate', 'grades', 'academic'
                ]
            },
            'COE': {
                'high_confidence': [
                    'certificate of enrollment', 'coe', 'enrollment certificate',
                    'enrollment proof', 'student enrollment'
                ],
                'medium_confidence': [
                    'enrollment certificate', 'enrollment', 'enrolled'
                ],
                'low_confidence': [
                    'enrollment', 'student', 'enrolled'
                ]
            },
            'OTHERS': {
                'high_confidence': [
                    'other certificate', 'custom certificate', 'special certificate',
                    'additional document', 'miscellaneous'
                ],
                'medium_confidence': [
                    'certificate', 'document', 'paper', 'other'
                ],
                'low_confidence': [
                    'document', 'certificate', 'paper'
                ]
            }
        }
        
        # Context patterns that help disambiguate
        self.context_patterns = {
            'academic_purpose': ['scholarship', 'transfer', 'graduate', 'employment'],
            'enrollment_purpose': ['enrollment', 'registration', 'student status'],
            'grade_purpose': ['grades', 'gpa', 'academic performance']
        }
    
    def classify_document_type(self, text: str, session: Dict = None) -> Dict:
        """Enhanced document type classification with confidence scoring"""
        text_lower = text.lower().strip()
        
        # Get confidence scores for each document type
        scores = {}
        for doc_type in self.keyword_patterns.keys():
            scores[doc_type] = self._calculate_confidence_score(text_lower, doc_type)
        
        # Find the best match
        best_match = max(scores.items(), key=lambda x: x[1])
        doc_type, confidence = best_match
        
        # Apply context-based adjustments
        if session:
            confidence = self._apply_context_adjustments(text_lower, doc_type, confidence, session)
        
        # Generate alternative suggestions
        alternatives = self._generate_alternatives(scores, doc_type)
        
        return {
            'document_type': doc_type,
            'confidence': confidence,
            'alternatives': alternatives,
            'reasoning': self._generate_reasoning(text_lower, doc_type, confidence)
        }
    
    def _calculate_confidence_score(self, text: str, doc_type: str) -> float:
        """Calculate confidence score for a document type"""
        patterns = self.keyword_patterns[doc_type]
        score = 0.0
        
        # High confidence keywords (weight: 1.0)
        for keyword in patterns['high_confidence']:
            if keyword in text:
                score += 1.0
        
        # Medium confidence keywords (weight: 0.7)
        for keyword in patterns['medium_confidence']:
            if keyword in text:
                score += 0.7
        
        # Low confidence keywords (weight: 0.3)
        for keyword in patterns['low_confidence']:
            if keyword in text:
                score += 0.3
        
        # Normalize score to 0-1 range
        max_possible_score = len(patterns['high_confidence']) + \
                           len(patterns['medium_confidence']) * 0.7 + \
                           len(patterns['low_confidence']) * 0.3
        
        return min(score / max_possible_score, 1.0) if max_possible_score > 0 else 0.0
    
    def _apply_context_adjustments(self, text: str, doc_type: str, confidence: float, session: Dict) -> float:
        """Apply context-based adjustments to confidence score"""
        adjusted_confidence = confidence
        
        # Check for context patterns
        for context_type, keywords in self.context_patterns.items():
            if any(keyword in text for keyword in keywords):
                if context_type == 'academic_purpose' and doc_type == 'OTR':
                    adjusted_confidence += 0.1
                elif context_type == 'enrollment_purpose' and doc_type == 'COE':
                    adjusted_confidence += 0.1
                elif context_type == 'grade_purpose' and doc_type == 'COG':
                    adjusted_confidence += 0.1
        
        # Check user history for preferences
        if session.get('user_id'):
            user_preferences = self._get_user_preferences(session['user_id'])
            if doc_type in user_preferences.get('preferred_doc_types', []):
                adjusted_confidence += 0.05
        
        return min(adjusted_confidence, 1.0)
    
    def _get_user_preferences(self, user_id: str) -> Dict:
        """Get user preferences from database (placeholder)"""
        # This would integrate with your database
        return {
            'preferred_doc_types': ['OTR', 'COG'],
            'frequent_requests': ['OTR']
        }
    
    def _generate_alternatives(self, scores: Dict, primary_doc_type: str) -> List[Dict]:
        """Generate alternative document type suggestions"""
        alternatives = []
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        for doc_type, score in sorted_scores[1:]:  # Skip the primary match
            if score > 0.3:  # Only include alternatives with decent confidence
                alternatives.append({
                    'document_type': doc_type,
                    'confidence': score,
                    'reason': self._get_alternative_reason(doc_type, score)
                })
        
        return alternatives[:2]  # Limit to 2 alternatives
    
    def _get_alternative_reason(self, doc_type: str, score: float) -> str:
        """Get reason for alternative suggestion"""
        reasons = {
            'OTR': 'Academic transcript for complete records',
            'COG': 'Grade certificate for specific semesters',
            'COE': 'Enrollment certificate for current status',
            'OTHERS': 'Custom certificate for special needs'
        }
        return reasons.get(doc_type, 'Alternative document option')
    
    def _generate_reasoning(self, text: str, doc_type: str, confidence: float) -> str:
        """Generate human-readable reasoning for the classification"""
        if confidence > 0.8:
            return f"High confidence match for {doc_type} based on explicit keywords"
        elif confidence > 0.5:
            return f"Medium confidence match for {doc_type} based on related keywords"
        else:
            return f"Low confidence match for {doc_type}, may need clarification"
    
    def fuzzy_match_document_type(self, text: str) -> List[Tuple[str, float]]:
        """Fuzzy matching for document types with similarity scores"""
        text_lower = text.lower()
        matches = []
        
        for doc_type, patterns in self.keyword_patterns.items():
            best_similarity = 0.0
            for confidence_level in patterns.values():
                for keyword in confidence_level:
                    similarity = SequenceMatcher(None, text_lower, keyword).ratio()
                    best_similarity = max(best_similarity, similarity)
            
            if best_similarity > 0.3:  # Only include matches above threshold
                matches.append((doc_type, best_similarity))
        
        return sorted(matches, key=lambda x: x[1], reverse=True)
    
    def extract_entities(self, text: str) -> Dict:
        """Extract entities from user input"""
        entities = {
            'document_types': [],
            'purposes': [],
            'urgency_indicators': [],
            'time_references': []
        }
        
        text_lower = text.lower()
        
        # Extract document types
        for doc_type in self.keyword_patterns.keys():
            if any(keyword in text_lower for keyword in 
                   self.keyword_patterns[doc_type]['high_confidence'] + 
                   self.keyword_patterns[doc_type]['medium_confidence']):
                entities['document_types'].append(doc_type)
        
        # Extract purposes
        purpose_keywords = {
            'scholarship': ['scholarship', 'grant', 'financial aid'],
            'employment': ['job', 'work', 'employment', 'career'],
            'transfer': ['transfer', 'university', 'college'],
            'graduate': ['graduate', 'masters', 'phd', 'doctorate']
        }
        
        for purpose, keywords in purpose_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                entities['purposes'].append(purpose)
        
        # Extract urgency indicators
        urgency_keywords = ['urgent', 'asap', 'immediately', 'rush', 'deadline']
        entities['urgency_indicators'] = [word for word in urgency_keywords if word in text_lower]
        
        return entities
