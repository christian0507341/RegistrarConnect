# 🚀 Quick Start Guide - RegistrarConnect

## Complete setup and testing guide for all portals

---

## ⚡ **1. BACKEND SETUP**

### Start the Django backend:

```bash
cd backend
python manage.py runserver
```

Backend will run on `http://127.0.0.1:8000`

### Create test users (one-time setup):

```bash
python manage.py shell
```

Then paste this code:

```python
from accounts.models import User

# Admin User
admin = User.objects.create_user(
    username='admin1',
    email='admin1.up@phinmaed.com',
    password='admin123',
    role='admin',
    first_name='System',
    last_name='Administrator'
)
print(f"✅ Created admin: {admin.email}")

# Registrar User
registrar = User.objects.create_user(
    username='registrar1',
    email='registrar1.up@phinmaed.com',
    password='test123',
    role='registrar',
    first_name='Test',
    last_name='Registrar'
)
print(f"✅ Created registrar: {registrar.email}")

# Finance User
finance = User.objects.create_user(
    username='finance1',
    email='finance1.up@phinmaed.com',
    password='test123',
    role='finance',
    first_name='Test',
    last_name='Finance'
)
print(f"✅ Created finance: {finance.email}")

# Student User
student = User.objects.create_user(
    username='student1',
    email='student1.up@phinmaed.com',
    password='test123',
    role='student',
    first_name='John',
    last_name='Doe',
    student_id='2021-12345'
)
print(f"✅ Created student: {student.email}")

# Faculty User
faculty = User.objects.create_user(
    username='faculty1',
    email='faculty1.up@phinmaed.com',
    password='test123',
    role='faculty',
    first_name='Prof',
    last_name='Smith'
)
print(f"✅ Created faculty: {faculty.email}")

print("\n🎉 All test users created successfully!")
print("\nCredentials:")
print("Admin:     admin1.up@phinmaed.com / admin123")
print("Registrar: registrar1.up@phinmaed.com / test123")
print("Finance:   finance1.up@phinmaed.com / test123")
print("Student:   student1.up@phinmaed.com / test123")
print("Faculty:   faculty1.up@phinmaed.com / test123")
```

---

## 🌐 **2. FRONTEND SETUP**

### Start the React frontend:

```bash
cd web/registrarconnect-admin
npm install  # First time only
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🧪 **3. TEST EACH PORTAL**

### **A. Admin Portal (Purple)**

1. **Login:**
   - Go to `http://localhost:3000/login`
   - Select "Admin" role
   - Email: `admin1.up@phinmaed.com`
   - Password: `admin123`

2. **Test Dashboard (`/admin/dashboard`):**
   - ✅ Should show real user counts
   - ✅ Should show request statistics
   - ✅ Should show appointment numbers

3. **Test User Management (`/admin/users`):**
   - ✅ Click "Add New User" → Create a test user
   - ✅ Click edit icon → Update user details
   - ✅ Filter by role → Should filter correctly
   - ✅ Search for user → Should find users

4. **Test Activity Logs (`/admin/logs`):**
   - ✅ Should show system activities
   - ✅ Filter by action type
   - ✅ Change result limit

5. **Test Reports (`/admin/reports`):**
   - ✅ View all analytics charts
   - ✅ See user/request breakdowns

---

### **B. Student Portal (Green)**

1. **Login:**
   - Email: `student1.up@phinmaed.com`
   - Password: `test123`
   - Role: Student

2. **Test Features:**
   - ✅ View dashboard
   - ✅ Create new document request
   - ✅ Upload payment receipt (optional)
   - ✅ View request history
   - ✅ Check notifications
   - ✅ Test AI chat

---

### **C. Finance Portal (Teal)**

1. **Login:**
   - Email: `finance1.up@phinmaed.com`
   - Password: `test123`
   - Role: Finance

2. **Test Features:**
   - ✅ View dashboard stats
   - ✅ Go to Verification screen
   - ✅ Approve/reject student payment
   - ✅ View financial reports
   - ✅ Check payment analytics

---

### **D. Registrar Portal (Orange)**

1. **Login:**
   - Email: `registrar1.up@phinmaed.com`
   - Password: `test123`
   - Role: Registrar

2. **Test Features:**
   - ✅ View dashboard stats
   - ✅ Go to "Trigger & Approve"
   - ✅ Approve document request
   - ✅ Verify auto-scheduling triggered
   - ✅ View appointments
   - ✅ Mark appointment as claimed
   - ✅ Manage schedule slots

---

### **E. Faculty Portal (Blue)**

1. **Login:**
   - Email: `faculty1.up@phinmaed.com`
   - Password: `test123`
   - Role: Faculty

2. **Test Features:**
   - ✅ View dashboard
   - ✅ View student requests
   - ✅ Monitor appointments
   - ✅ Generate reports

---

## 🔄 **4. TEST COMPLETE WORKFLOW**

### End-to-End Testing:

1. **Student** creates request
   - Login as student
   - Go to "New Request"
   - Fill form, submit

2. **Student** uploads receipt
   - Go to "My Requests"
   - Click "Upload Receipt"
   - Upload image/PDF

3. **Finance** approves payment
   - Logout, login as finance
   - Go to "Verification"
   - Find student's payment
   - Click "Approve"

4. **Registrar** approves document
   - Logout, login as registrar
   - Go to "Trigger & Approve"
   - Find approved payment
   - Click "Approve"
   - System auto-schedules appointment

5. **Student** sees appointment
   - Logout, login as student
   - Go to "Appointments"
   - Should see scheduled appointment

6. **Registrar** marks as claimed
   - Login as registrar
   - Go to "Appointments"
   - Mark as claimed

7. **Admin** monitors everything
   - Login as admin
   - Check activity logs
   - View reports
   - See all statistics

---

## ✅ **5. VERIFICATION CHECKLIST**

### **Backend:**
- [ ] Server running on port 8000
- [ ] No migration errors
- [ ] All test users created
- [ ] Can access `/api/auth/admin/stats/` in browser

### **Frontend:**
- [ ] App running on port 3000
- [ ] No console errors
- [ ] All 5 portals accessible
- [ ] Login works for all roles

### **Database:**
- [ ] Users table has 5 users
- [ ] Can create document requests
- [ ] Appointments auto-schedule
- [ ] Actions are logged

---

## 🔧 **6. TROUBLESHOOTING**

### **Problem: Can't login**
- Check backend is running
- Verify user email/password
- Check browser console for errors
- Verify role selection matches user role

### **Problem: Data not loading**
- Check backend is running on port 8000
- Check browser Network tab
- Verify JWT token in localStorage
- Check API_BASE_URL in `src/services/api.ts`

### **Problem: 403 Forbidden**
- User doesn't have correct role
- Token expired (refresh page)
- Check backend logs

### **Problem: Auto-scheduling not working**
- Check registrar has configured time slots
- Verify document was approved (not just payment)
- Check backend logs for errors
- Visit `/admin/schedule` to add slots

---

## 📊 **7. VERIFY DATABASE CONNECTION**

### Check data is being saved:

```bash
python manage.py shell
```

```python
from accounts.models import User
from document_requests.models import DocumentRequest
from appointments.models import Appointment

# Count users
print(f"Total users: {User.objects.count()}")

# Count requests
print(f"Total requests: {DocumentRequest.objects.count()}")

# Count appointments
print(f"Total appointments: {Appointment.objects.count()}")

# View recent activity
from document_requests.models import DocumentRequestAction
recent = DocumentRequestAction.objects.all().order_by('-created_at')[:5]
for action in recent:
    print(f"{action.created_at}: {action.user} {action.action} {action.document_request}")
```

---

## 🎯 **8. SUCCESS CRITERIA**

You should be able to:
- ✅ Login to all 5 portals
- ✅ See real data from database
- ✅ Create, read, update, delete (CRUD)
- ✅ Filter and search data
- ✅ View real-time statistics
- ✅ Complete full workflow
- ✅ See activity logs
- ✅ Generate reports

---

## 📱 **9. MOBILE APP (Optional)**

If you want to test the mobile app:

```bash
cd mobile
flutter run
```

Mobile app uses same backend API!

---

## 🎉 **SUCCESS!**

If everything works:
- ✅ All portals are database-connected
- ✅ Full CRUD operations working
- ✅ Role-based access control active
- ✅ Auto-scheduling functional
- ✅ Real-time updates working

**Your RegistrarConnect system is fully operational!** 🚀

---

## 📞 **NEED HELP?**

Check the detailed documentation:
- `ADMIN_DATABASE_CONNECTED.md` - Admin portal details
- `DATABASE_INTEGRATION_COMPLETE.md` - Registrar & Finance
- `ALL_PORTALS_DATABASE_CONNECTED.md` - Complete overview

---

**Happy Testing! 🎊**

