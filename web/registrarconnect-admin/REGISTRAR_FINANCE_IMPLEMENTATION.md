# Registrar & Finance Portals Implementation Guide

## Overview
Two new dedicated portals have been created to replace the Faculty portal:
1. **Registrar Portal** (Orange Theme) - Document processing and approval
2. **Finance Portal** (Teal Theme) - Payment processing

---

## Backend Changes

### Database Migration
✅ Created: `backend/accounts/migrations/0006_update_user_roles.py`

### Updated Roles
```python
class Roles(models.TextChoices):
    STUDENT = "student", _("Student")
    REGISTRAR = "registrar", _("Registrar")  # NEW
    FINANCE = "finance", _("Finance")        # NEW
    ADMIN = "admin", _("Admin")
```

**To apply migration:**
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## Registrar Portal (Orange Theme)

### Purpose
- Handle document requests (COG, COE, TOR, Diploma)
- Trigger document approval
- Automatically schedule appointments for claiming
- Manage claiming schedule

### Theme Colors
- Primary: Orange (#f97316)
- Secondary: Amber (#f59e0b)
- Sidebar: Dark Orange Gradient

### Screens Needed
1. ✅ **RegistrarLayout.tsx** - Created
2. **RegistrarDashboard.tsx** - Pending requests, today's claims
3. **RegistrarRequestsScreen.tsx** - All document requests with filters
4. **RegistrarApprovalScreen.tsx** - Trigger approval & auto-schedule
5. **RegistrarAppointmentsScreen.tsx** - View all claiming appointments
6. **RegistrarScheduleScreen.tsx** - Set available claiming time slots
7. **RegistrarNotificationsScreen.tsx** - System notifications
8. **RegistrarProfileScreen.tsx** - Profile management

### Key Features
- **Trigger Document Approval**: Mark documents as ready
- **Auto-Schedule Appointments**: System automatically creates appointment slots when approved
- **Claiming Schedule**: Manage when students can claim documents
- **Request Processing**: View, filter, and process all document requests

---

## Finance Portal (Teal Theme)

### Purpose
- Handle payment verification
- Process payment confirmations
- Generate payment reports
- Track payment status

### Theme Colors
- Primary: Teal (#14b8a6)
- Secondary: Cyan (#06b6d4)
- Sidebar: Dark Teal Gradient

### Screens Needed
1. **FinanceLayout.tsx** - Layout component
2. **FinanceDashboard.tsx** - Payment overview, pending payments
3. **FinancePaymentsScreen.tsx** - All payments with filters
4. **FinanceVerificationScreen.tsx** - Verify and approve payments
5. **FinanceReportsScreen.tsx** - Payment reports and analytics
6. **FinanceNotificationsScreen.tsx** - Payment alerts
7. **FinanceProfileScreen.tsx** - Profile management

### Key Features
- **Payment Verification**: Confirm payment receipts
- **Payment Approval**: Mark payments as approved/rejected
- **Payment Reports**: Generate financial reports
- **Transaction History**: Track all payments

---

## Frontend Implementation Plan

### Step 1: Create All Screen Files
Due to token limits, I'll provide you with the structure:

```typescript
// Registrar Screens
web/registrarconnect-admin/src/screens/
├── RegistrarDashboard.tsx
├── RegistrarRequestsScreen.tsx
├── RegistrarApprovalScreen.tsx
├── RegistrarAppointmentsScreen.tsx
├── RegistrarScheduleScreen.tsx
├── RegistrarNotificationsScreen.tsx
└── RegistrarProfileScreen.tsx

// Finance Screens
├── FinanceDashboard.tsx
├── FinancePaymentsScreen.tsx
├── FinanceVerificationScreen.tsx
├── FinanceReportsScreen.tsx
├── FinanceNotificationsScreen.tsx
└── FinanceProfileScreen.tsx
```

### Step 2: Create CSS Files
```css
web/registrarconnect-admin/src/styles/
├── registrar-portal.css (2000+ lines)
└── finance-portal.css (2000+ lines)
```

### Step 3: Update App.tsx Routing
```typescript
// Add state
const [isRegistrarAuthenticated, setIsRegistrarAuthenticated] = useState(false);
const [isFinanceAuthenticated, setIsFinanceAuthenticated] = useState(false);

// Add routes
<Route path="/registrar/*" element={<RegistrarLayout />}>
  <Route path="dashboard" element={<RegistrarDashboard />} />
  // ... more routes
</Route>

<Route path="/finance/*" element={<FinanceLayout />}>
  <Route path="dashboard" element={<FinanceDashboard />} />
  // ... more routes
</Route>
```

### Step 4: Update UnifiedLogin.tsx
```typescript
if (userRole === "registrar") {
  setIsRegistrarAuthenticated(true);
  navigate("/registrar/dashboard");
} else if (userRole === "finance") {
  setIsFinanceAuthenticated(true);
  navigate("/finance/dashboard");
}
```

---

## Workflow Integration

### Document Request Flow
1. **Student** submits request → Student Portal
2. **Finance** verifies payment → Finance Portal
3. **Registrar** approves document → Registrar Portal
4. **System** auto-creates claiming appointment
5. **Student** notified of appointment → Student Portal
6. **Student** claims document at scheduled time

### Payment Flow
1. **Student** uploads payment proof → Student Portal
2. **Finance** receives notification → Finance Portal
3. **Finance** verifies payment → Mark approved/rejected
4. **Registrar** sees payment status → Can process if paid
5. **Student** notified of payment status → Student Portal

---

## Auto-Scheduling Logic (Registrar)

When registrar approves a document:
```python
# Backend Logic (to be implemented)
def trigger_document_approval(request_id):
    1. Mark document as approved
    2. Find next available claiming slot
    3. Create appointment automatically
    4. Send notification to student
    5. Update request status to "ready_for_claiming"
```

---

## Database Updates Needed

### New Appointment Types
```python
APPOINTMENT_TYPES = [
    ('general', 'General Inquiry'),
    ('document_claiming', 'Document Claiming'),  # NEW
    ('payment_verification', 'Payment Verification'),  # NEW
]
```

### New Request Statuses
```python
REQUEST_STATUS = [
    ('pending', 'Pending'),
    ('payment_pending', 'Awaiting Payment'),
    ('payment_approved', 'Payment Approved'),
    ('processing', 'Processing'),
    ('ready_for_claiming', 'Ready for Claiming'),  # NEW
    ('claimed', 'Claimed'),  # NEW
    ('completed', 'Completed'),
    ('rejected', 'Rejected'),
]
```

---

## Portal Comparison

| Feature | Student | Registrar | Finance | Admin |
|---------|---------|-----------|---------|-------|
| **Theme** | Green | Orange | Teal | Purple |
| **Main Task** | Request docs | Process docs | Verify payments | Manage system |
| **Can Create Requests** | ✅ | ❌ | ❌ | ✅ |
| **Can Approve Requests** | ❌ | ✅ | ❌ | ✅ |
| **Can Verify Payments** | ❌ | ❌ | ✅ | ✅ |
| **Auto-Schedule** | ❌ | ✅ | ❌ | ✅ |
| **View All Users** | ❌ | ❌ | ❌ | ✅ |

---

## Next Steps

### Immediate (You need to create):
1. Create all Registrar screen files (7 screens)
2. Create all Finance screen files (6 screens)
3. Create `registrar-portal.css` (2000+ lines)
4. Create `finance-portal.css` (2000+ lines)
5. Create FinanceLayout.tsx
6. Update App.tsx with new routes
7. Update UnifiedLogin.tsx

### Backend (To implement):
1. Add auto-scheduling logic in document approval
2. Update appointment model with new types
3. Update request status options
4. Create registrar/finance specific API endpoints

---

## Quick Start Template

### Registrar Dashboard Template
```typescript
export default function RegistrarDashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 12,
    todayClaimings: 5,
    processedToday: 8,
    scheduledAppointments: 15
  });

  return (
    <div className="registrar-dashboard">
      {/* Stats cards */}
      {/* Pending requests list */}
      {/* Today's claiming schedule */}
      {/* Quick actions */}
    </div>
  );
}
```

### Finance Dashboard Template
```typescript
export default function FinanceDashboard() {
  const [stats, setStats] = useState({
    pendingPayments: 18,
    verifiedToday: 12,
    totalRevenue: 45000,
    rejectedPayments: 3
  });

  return (
    <div className="finance-dashboard">
      {/* Payment stats */}
      {/* Pending verifications */}
      {/* Recent transactions */}
      {/* Quick actions */}
    </div>
  );
}
```

---

## Summary

✅ **Backend**: Database migration created, roles updated
✅ **Registrar Layout**: Created
⏳ **Registrar Screens**: Need to create 7 screens
⏳ **Finance Layout**: Need to create
⏳ **Finance Screens**: Need to create 6 screens
⏳ **CSS**: Need to create 2 portal CSS files
⏳ **Routing**: Need to update App.tsx
⏳ **Login**: Need to update UnifiedLogin.tsx

**Due to token limits, I recommend creating these files incrementally. Would you like me to:**
A) Create just the key dashboard screens for both portals
B) Create the complete CSS first
C) Focus on one portal at a time (Registrar first, then Finance)




