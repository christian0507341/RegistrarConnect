# Mobile Notification System Guide

## Overview
The mobile app now has a comprehensive notification system that ensures logged-in users receive their own personalized notifications in real-time.

## How It Works

### 1. **Authentication-Based Notifications**
- Notifications are tied to the logged-in user's account
- Only authenticated users receive notifications
- Each user gets their own notification feed

### 2. **Real-Time Polling**
- App polls for new notifications every 30 seconds when user is authenticated
- Polling automatically starts when user logs in
- Polling stops when user logs out

### 3. **Two Types of Notifications**

#### **Regular Notifications** (`/api/document-requests/student/notifications/`)
- Document request status changes
- System announcements
- General updates related to user's requests

#### **Pending Notifications** (`/api/document-requests/student/pending-notifications/`)
- Payment approvals
- Document approvals
- Real-time status updates from admin actions

### 4. **Notification Sources**

#### **Backend Triggers:**
- **Payment Approval**: When admin approves a payment
- **Document Approval**: When admin approves a document
- **Status Changes**: When document request status changes
- **System Events**: Maintenance, announcements, etc.

#### **Mobile Triggers:**
- **Appointment Scheduling**: When user schedules an appointment
- **Document Upload**: When user uploads a receipt
- **Status Updates**: When user checks request status

## Technical Implementation

### **Authentication Flow:**
1. User logs in → AuthBloc emits `AuthAuthenticated`
2. NotificationAuthService starts polling
3. App fetches user-specific notifications
4. Notifications displayed in real-time

### **Notification Polling:**
```dart
// Polling starts automatically when user is authenticated
NotificationAuthService().startPollingForAuthenticatedUser();

// Polling stops when user logs out
NotificationAuthService().stopPolling();
```

### **Backend Integration:**
- Notifications stored in cache with user-specific keys
- Cache key format: `pending_notifications_{student_id}`
- Notifications expire after 7 days
- Real-time updates via Django signals

## User Experience

### **For Logged-In Users:**
1. **Automatic Notifications**: Receive notifications without manual refresh
2. **Real-Time Updates**: Get notified immediately when admin takes action
3. **Personalized Feed**: Only see notifications relevant to their account
4. **Persistent Storage**: Notifications persist across app sessions

### **For Logged-Out Users:**
1. **No Notifications**: Polling stops, no notifications received
2. **Login Required**: Must log in to receive notifications
3. **Clean State**: No notification history when logged out

## Notification Types

### **Payment Notifications:**
- ✅ Payment Approved
- ❌ Payment Rejected
- 💳 Payment Required

### **Document Notifications:**
- 📄 Document Approved
- 📋 Document Processing
- ✅ Document Ready for Claiming

### **System Notifications:**
- 🔧 System Maintenance
- 📢 Announcements
- ⚠️ Important Updates

## Testing the System

### **Test User-Specific Notifications:**
1. **Login as Student A**
2. **Admin approves Student A's payment** (via web admin panel)
3. **Student A should receive notification** in mobile app
4. **Student B should NOT receive the notification**

### **Test Real-Time Updates:**
1. **Login to mobile app**
2. **Open notification page**
3. **Admin approves a payment** (via web admin panel)
4. **Notification should appear within 30 seconds**

### **Test Authentication:**
1. **Login to mobile app** → Notifications start polling
2. **Logout from mobile app** → Notifications stop polling
3. **Login again** → Notifications resume polling

## Debugging

### **Check Notification Status:**
```dart
// In notification repository, check console logs:
print('📬 Regular notifications found: ${notificationsData.length}');
print('📬 Pending notifications found: ${pendingData.length}');
```

### **Check Authentication:**
```dart
// In notification polling service:
developer.log('🔍 Checking for pending notifications...');
developer.log('📬 Found $count pending notifications');
```

### **Check Backend:**
- Check Django logs for notification creation
- Verify cache keys: `pending_notifications_{student_id}`
- Check API endpoints return correct data

## Common Issues & Solutions

### **Issue: No Notifications Received**
**Solutions:**
1. Check if user is authenticated
2. Check if notification polling is running
3. Check backend cache for notifications
4. Check API endpoints return data

### **Issue: Notifications from Wrong User**
**Solutions:**
1. Verify authentication token is correct
2. Check backend filters by `student_id`
3. Check cache keys are user-specific

### **Issue: Notifications Not Real-Time**
**Solutions:**
1. Check polling interval (30 seconds)
2. Check network connectivity
3. Check backend signal triggers
4. Check cache storage

## Security Features

- **User Isolation**: Each user only sees their own notifications
- **Authentication Required**: Must be logged in to receive notifications
- **Token Validation**: All requests include valid JWT tokens
- **Secure Storage**: Notifications stored securely in device storage

## Performance Optimizations

- **Efficient Polling**: Only polls when user is authenticated
- **Smart Caching**: Backend caches notifications for 7 days
- **Batch Processing**: Multiple notifications processed together
- **Automatic Cleanup**: Old notifications automatically removed

## Future Enhancements

- **Push Notifications**: Real-time push notifications via FCM
- **Notification Categories**: Group notifications by type
- **Read/Unread Status**: Track notification read status
- **Notification History**: Persistent notification history
- **Custom Sounds**: Different sounds for different notification types
