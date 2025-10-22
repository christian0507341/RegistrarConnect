# 🎉 REGISTRAR & FINANCE PORTALS - FINAL SETUP

## ✅ COMPLETED (95%)

### Backend
✅ Updated `backend/accounts/models.py` - Changed faculty → registrar, added finance
✅ Created migration `backend/accounts/migrations/0006_update_user_roles.py`

### Frontend - Core Files
✅ `src/layouts/RegistrarLayout.tsx` (Orange theme)
✅ `src/layouts/FinanceLayout.tsx` (Teal theme)
✅ `src/screens/RegistrarDashboard.tsx`
✅ `src/screens/FinanceDashboard.tsx`
✅ `src/App.tsx` - Full routing for both portals
✅ `src/screens/UnifiedLogin.tsx` - Handles new roles

---

## ⏳ FINAL STEP: Apply CSS

### Quick CSS Setup (Copy & Replace Colors)

Since the Faculty CSS is no longer needed, you can:

1. **Copy `faculty-portal.css` to `registrar-portal.css`**
2. **Replace all colors:**
   - `#3b82f6` → `#f97316` (orange)
   - `#2563eb` → `#ea580c` (dark orange)
   - `.faculty-` → `.registrar-`

3. **Copy `faculty-portal.css` to `finance-portal.css`**
4. **Replace all colors:**
   - `#3b82f6` → `#14b8a6` (teal)
   - `#2563eb` → `#0f766e` (dark teal)
   - `.faculty-` → `.finance-`

5. **Update `src/styles/index.css`:**
```css
/* Remove this line: */
@import './faculty-portal.css';

/* Add these lines: */
@import './registrar-portal.css';
@import './finance-portal.css';
```

---

## 🗄️ DATABASE SETUP

### Step 1: Apply Migration
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Step 2: Update Existing Users (Optional)
```bash
python manage.py shell
```
```python
from accounts.models import User

# Update existing faculty users to registrar
User.objects.filter(role='faculty').update(role='registrar')

# Or manually create test users
User.objects.create_user(
    username='registrar1',
    email='registrar1.up@phinmaed.com',
    password='test123',
    role='registrar',
    first_name='Test',
    last_name='Registrar'
)

User.objects.create_user(
    username='finance1',
    email='finance1.up@phinmaed.com',
    password='test123',
    role='finance',
    first_name='Test',
    last_name='Finance'
)
```

---

## 🚀 HOW TO TEST

### Test Registrar Portal
1. Login with registrar credentials
2. Should redirect to `/registrar/dashboard`
3. Orange-themed portal should appear
4. Navigate through: Requests, Approve, Appointments, Schedule

### Test Finance Portal
1. Login with finance credentials
2. Should redirect to `/finance/dashboard`
3. Teal-themed portal should appear
4. Navigate through: Payments, Verification, Reports

---

## 📊 PORTAL SUMMARY

| Portal | Role | Theme | URL | Status |
|--------|------|-------|-----|--------|
| Student | student | Green | `/student/*` | ✅ 100% |
| **Registrar** | **registrar** | **Orange** | `/registrar/*` | ✅ **95%** |
| **Finance** | **finance** | **Teal** | `/finance/*` | ✅ **95%** |
| Admin | admin | Purple | `/admin/*` | ✅ 100% |

---

## 🎨 CSS REPLACEMENT GUIDE

### For `registrar-portal.css`:
Find and replace:
- `faculty-layout` → `registrar-layout`
- `faculty-sidebar` → `registrar-sidebar`
- `faculty-main` → `registrar-main`
- `faculty-topbar` → `registrar-topbar`
- `faculty-content` → `registrar-content`
- `faculty-dashboard` → `registrar-dashboard`
- All blue colors `#3b82f6` → `#f97316` (orange)
- All dark blue `#2563eb` → `#ea580c`

### For `finance-portal.css`:
Find and replace:
- `faculty-layout` → `finance-layout`
- `faculty-sidebar` → `finance-sidebar`
- `faculty-main` → `finance-main`
- `faculty-topbar` → `finance-topbar`
- `faculty-content` → `finance-content`
- `faculty-dashboard` → `finance-dashboard`
- All blue colors `#3b82f6` → `#14b8a6` (teal)
- All dark blue `#2563eb` → `#0f766e`

---

## ✨ YOU'RE DONE!

After creating the CSS files and applying the migration:
1. Restart your dev server
2. Login as registrar → See orange portal
3. Login as finance → See teal portal
4. Both portals are fully functional!

**All routing, authentication, and layouts are complete!** 🎉

