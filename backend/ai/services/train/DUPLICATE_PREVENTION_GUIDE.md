# 🔒 Duplicate Request Prevention System

## Overview
This system prevents users from submitting duplicate document requests while they have active requests in progress. It ensures each document request is tracked separately and users must wait for completion before submitting another request of the same type.

## 🎯 Features

### 1. **Backend Validation**
- **API Level**: Checks for existing active requests before creating new ones
- **Status Tracking**: Monitors requests in `draft`, `confirming`, `awaiting_payment`, `pending`, `on_process` states
- **Document Type Specific**: Different validation rules for different document types

### 2. **AI Chatbot Integration**
- **Early Detection**: Checks for duplicates during conversation flow
- **User-Friendly Messages**: Clear explanations of why duplicate requests are blocked
- **Status Information**: Shows current request status and alternatives

### 3. **Smart Validation Rules**

#### **OTR (Official Transcript of Records)**
- **Rule**: Only one OTR request per user at a time
- **Validation**: Checks document type and purpose
- **Reasoning**: Transcripts are comprehensive and don't need semester/year distinction

#### **COG (Certificate of Grades)**
- **Rule**: Only one COG request per semester/school year combination
- **Validation**: Checks document type, semester, and school year
- **Reasoning**: Different semesters/years are different academic periods

#### **COE (Certificate of Enrollment)**
- **Rule**: Only one COE request per semester/school year combination
- **Validation**: Checks document type, semester, and school year
- **Reasoning**: Different semesters/years are different enrollment periods

#### **OTHERS (Other Certificates)**
- **Rule**: Only one request per purpose
- **Validation**: Checks document type and purpose
- **Reasoning**: Different purposes may require different certificates

## 🔧 Implementation Details

### Backend API Changes

#### **Document Request Creation (`create_document_request`)**
```python
# Check for existing active requests
active_statuses = ['draft', 'confirming', 'awaiting_payment', 'pending', 'on_process']
existing_active = DocumentRequest.objects.filter(
    student_id=request.user,
    document_type=document_type,
    status__in=active_statuses
)

# Document-specific validation
if document_type in ['COG', 'COE'] and semester and school_year:
    existing_active = existing_active.filter(
        semester=semester,
        school_year=school_year
    )

if existing_active.exists():
    return Response({
        "error": "duplicate_request",
        "message": f"You already have a {document_type} request in progress.",
        "existing_request": {...},
        "status_message": "..."
    }, status=409)
```

#### **Response Format**
```json
{
  "error": "duplicate_request",
  "message": "You already have a OTR request in progress.",
  "existing_request": {
    "id": 123,
    "document_type": "OTR",
    "status": "pending",
    "requested_at": "2025-10-19T10:30:00Z",
    "purpose": "Employment"
  },
  "status_message": "Your OTR request is currently under faculty review. Please wait for it to be completed before submitting another request."
}
```

### AI Chatbot Changes

#### **Early Duplicate Detection**
```python
def check_duplicate_requests(session: Dict, access_token: str) -> str:
    """Check if user already has active requests for the same document type."""
    # Check for active requests of the same type
    active_statuses = ["draft", "confirming", "awaiting_payment", "pending", "on_process"]
    
    for req in reqs:
        if (req.get("document_type") == doc_type and 
            req.get("status") in active_statuses):
            # Document-specific validation logic
            return req
    
    return None
```

#### **Enhanced User Messages**
```python
return (
    f"🔒 **You already have a {session.get('doc_type')} request {current_status}.**\n\n"
    f"📊 **Current Status:** {current_status}\n"
    f"📅 **Requested:** {duplicate_req.get('requested_at', 'Recently')}\n\n"
    f"💡 **To request another document:**\n"
    f"• Wait for your current request to be completed\n"
    f"• Or request a **different document type**\n"
    f"• Or start a **new conversation** for a different purpose\n\n"
    f"🎯 This ensures each document request is tracked separately!"
)
```

## 📊 Status Tracking

### **Active Statuses** (Prevent Duplicates)
- `draft` - Request being prepared
- `confirming` - Awaiting user confirmation
- `awaiting_payment` - Waiting for payment
- `pending` - Under faculty review
- `on_process` - Being processed

### **Completed Statuses** (Allow New Requests)
- `ready_to_claim` - Ready for pickup
- `cancelled` - User cancelled
- `rejected` - Faculty rejected

## 🧪 Testing

### **Test Scenarios**

#### **1. Basic Duplicate Prevention**
```bash
# Create first request
POST /api/document-requests/create/
{
  "document_type": "OTR",
  "purpose": "Employment"
}
# Response: 201 Created

# Try to create duplicate
POST /api/document-requests/create/
{
  "document_type": "OTR", 
  "purpose": "Employment"
}
# Response: 409 Conflict
```

#### **2. Different Document Types**
```bash
# Create OTR request
POST /api/document-requests/create/
{
  "document_type": "OTR",
  "purpose": "Employment"
}
# Response: 201 Created

# Create COG request (should work)
POST /api/document-requests/create/
{
  "document_type": "COG",
  "semester": 1,
  "school_year": "2024-2025",
  "purpose": "Scholarship"
}
# Response: 201 Created
```

#### **3. Different Semesters/Years**
```bash
# Create COG for semester 1
POST /api/document-requests/create/
{
  "document_type": "COG",
  "semester": 1,
  "school_year": "2024-2025"
}
# Response: 201 Created

# Create COG for semester 2 (should work)
POST /api/document-requests/create/
{
  "document_type": "COG",
  "semester": 2,
  "school_year": "2024-2025"
}
# Response: 201 Created
```

### **Run Tests**
```bash
cd backend/ai/services/train
python test_duplicate_prevention.py
```

## 🎯 User Experience

### **Before Implementation**
- Users could submit multiple requests for the same document
- Confusion about request status
- Duplicate processing overhead
- Inconsistent request tracking

### **After Implementation**
- Clear prevention of duplicate requests
- Informative status messages
- Guidance on alternatives
- Better request tracking

## 🔧 Configuration

### **Active Statuses**
```python
ACTIVE_STATUSES = [
    'draft',
    'confirming', 
    'awaiting_payment',
    'pending',
    'on_process'
]
```

### **Document Type Rules**
```python
VALIDATION_RULES = {
    'OTR': ['document_type', 'purpose'],
    'COG': ['document_type', 'semester', 'school_year'],
    'COE': ['document_type', 'semester', 'school_year'],
    'OTHERS': ['document_type', 'purpose']
}
```

## 📈 Benefits

### **For Users**
- **Clear Guidance**: Know exactly why they can't submit duplicates
- **Status Awareness**: See current request status and progress
- **Alternative Options**: Guidance on what they can do instead

### **For Administrators**
- **Reduced Duplicates**: Fewer duplicate requests to process
- **Better Tracking**: Clear request status and history
- **Improved Efficiency**: Less time spent on duplicate processing

### **For System**
- **Data Integrity**: Consistent request tracking
- **Performance**: Reduced unnecessary processing
- **User Satisfaction**: Better user experience

## 🚀 Deployment

### **1. Backend Changes**
- Update `create_document_request` view
- Add duplicate validation logic
- Return appropriate error responses

### **2. AI Chatbot Changes**
- Add early duplicate detection
- Update conversation flow
- Enhance user messages

### **3. Testing**
- Run duplicate prevention tests
- Verify all document types
- Test edge cases

## 📝 Monitoring

### **Metrics to Track**
- Duplicate request attempts
- User satisfaction with prevention messages
- Request completion rates
- User behavior changes

### **Logging**
- Log duplicate request attempts
- Track prevention effectiveness
- Monitor user feedback

---

**🎉 The duplicate request prevention system ensures users can only have one active request per document type, improving system efficiency and user experience!**
