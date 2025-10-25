# Persistent Login Implementation Guide

## Overview
The mobile app now supports persistent login, meaning users stay logged in even when they quit the app. Users will only need to log in again if they explicitly logout or if their session expires.

## How It Works

### 1. **Secure Token Storage**
- Access and refresh tokens are stored securely using `FlutterSecureStorage`
- Tokens persist across app restarts and device reboots
- Storage is encrypted and secure

### 2. **Session Validation on App Startup**
- When the app starts, it automatically checks for existing tokens
- If tokens exist, it validates them by calling the `/api/accounts/me/` endpoint
- If validation fails, it attempts to refresh the token
- If refresh fails, the user is logged out automatically

### 3. **Automatic Token Refresh**
- The app automatically refreshes expired access tokens using the refresh token
- This happens transparently in the background
- Users don't need to re-login unless both tokens are expired

### 4. **Smart Routing**
- Authenticated users are automatically directed to the home screen
- Unauthenticated users see the onboarding/login screen
- Loading states are handled gracefully

## Key Components

### AuthBloc Updates
- `CheckSession` event triggers on app startup
- Validates existing sessions and handles token refresh
- Manages authentication state throughout the app lifecycle

### SecureStorageService
- Stores access and refresh tokens securely
- Provides methods to clear auth data on logout
- Handles token persistence across app sessions

### AuthRepository
- `getCurrentUser()` method validates session by fetching user profile
- `refresh()` method handles token refresh
- `hasSession()` checks for existing tokens

## User Experience

### For Logged-In Users:
1. **App Startup**: User is automatically logged in and taken to home screen
2. **Background Refresh**: Tokens are refreshed automatically when needed
3. **Seamless Experience**: No need to re-enter credentials

### For Logged-Out Users:
1. **App Startup**: User sees onboarding/login screen
2. **Login Required**: User must enter credentials to access the app
3. **Session Persistence**: Once logged in, session persists until logout

### Logout Process:
1. **Explicit Logout**: User taps logout button in settings
2. **Confirmation Dialog**: App asks for confirmation
3. **Token Cleanup**: All stored tokens are cleared
4. **Redirect**: User is taken to login screen

## Security Features

- **Encrypted Storage**: All tokens are stored using device keychain/keystore
- **Automatic Cleanup**: Tokens are cleared on logout
- **Session Validation**: Tokens are validated on each app startup
- **Secure Refresh**: Token refresh happens securely in the background

## Testing the Implementation

### Test Persistent Login:
1. Login to the app
2. Close the app completely (not just minimize)
3. Reopen the app
4. You should be automatically logged in

### Test Logout:
1. Go to Settings
2. Tap "Logout"
3. Confirm logout
4. You should be taken to the login screen
5. Close and reopen the app
6. You should see the login screen (not logged in)

### Test Token Expiration:
1. Login to the app
2. Wait for access token to expire (or manually expire it on server)
3. Use the app - it should automatically refresh the token
4. App should continue working seamlessly

## Backend Requirements

The backend must support:
- `POST /api/token/` - Login endpoint
- `POST /api/token/refresh/` - Token refresh endpoint  
- `GET /api/accounts/me/` - Get current user profile

## Error Handling

- **Network Errors**: App handles network failures gracefully
- **Token Expiration**: Automatic refresh attempts
- **Invalid Tokens**: Automatic logout and redirect to login
- **Server Errors**: Proper error messages and fallback behavior

## Benefits

1. **Better UX**: Users don't need to login every time they open the app
2. **Security**: Tokens are stored securely and validated regularly
3. **Reliability**: Automatic token refresh ensures continuous access
4. **Flexibility**: Users can still logout to switch accounts
5. **Performance**: Faster app startup for returning users
